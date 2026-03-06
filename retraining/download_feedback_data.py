"""
Download Feedback Data from Google Cloud Storage (GCS)

This script downloads user-corrected images and YOLO labels from the GCS bucket
'retrain_smart_waste_model' to create a local dataset for model retraining.

Storage structure:
    gs://retrain_smart_waste_model/
    ├── training_data/images/{uuid}.jpg   ← Photos uploaded during classification
    └── training_data/labels/{uuid}.txt   ← YOLO labels from user feedback

Usage:
    python download_feedback_data.py [--output-dir ./dataset] [--min-samples 1000]

For Kaggle:
    Upload your serviceAccountKey.json as a Kaggle secret named 'FIREBASE_CREDENTIALS'
    The Firebase Admin SDK provides access to GCS buckets via the service account.
"""

import os
import json
import argparse
from pathlib import Path
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, storage, firestore


def initialize_firebase(credentials_path: str = None, credentials_json: dict = None):
    """Initialize Firebase with either a file path or JSON dict (for Kaggle secrets)."""
    if firebase_admin._apps:
        return  # Already initialized

    if credentials_json:
        cred = credentials.Certificate(credentials_json)
    elif credentials_path and os.path.exists(credentials_path):
        cred = credentials.Certificate(credentials_path)
    else:
        raise ValueError("No valid Firebase credentials provided")

    firebase_admin.initialize_app(cred)


def get_training_data_count(bucket) -> dict:
    """
    Count training samples by listing files directly from GCS bucket.
    Returns dict with image count, label count, and valid pairs.
    """
    # List all label files (these represent user-corrected data)
    label_blobs = list(bucket.list_blobs(prefix="training_data/labels/"))
    label_files = [b.name for b in label_blobs if b.name.endswith('.txt')]

    # List all image files
    image_blobs = list(bucket.list_blobs(prefix="training_data/images/"))
    image_ids = {b.name.replace("training_data/images/", "").replace(".jpg", "")
                 for b in image_blobs if b.name.endswith('.jpg')}

    # Count labels that have matching images
    valid_pairs = 0
    for label_path in label_files:
        image_id = label_path.replace("training_data/labels/", "").replace(".txt", "")
        if image_id in image_ids:
            valid_pairs += 1

    return {
        "total_images": len(image_ids),
        "total_labels": len(label_files),
        "valid_pairs": valid_pairs
    }


def download_training_data(
    bucket_name: str,
    output_dir: Path,
    min_samples: int = 0,
    max_samples: int = None
) -> dict:
    """
    Download images and labels directly from GCS bucket.
    Lists files in the bucket and downloads matching image+label pairs.

    Returns:
        dict with statistics about downloaded data
    """
    bucket = storage.bucket(bucket_name)

    # Check available training data by listing GCS files
    print("Scanning GCS bucket for training data...")
    stats = get_training_data_count(bucket)

    print(f"GCS bucket contents:")
    print(f"  Images: {stats['total_images']}")
    print(f"  Labels: {stats['total_labels']}")
    print(f"  Valid pairs: {stats['valid_pairs']}")

    if stats['valid_pairs'] < min_samples:
        print(f"Not enough samples. Need {min_samples}, have {stats['valid_pairs']}.")
        return {"status": "insufficient_data", "count": stats['valid_pairs'], "required": min_samples}

    # Create output directories
    images_dir = output_dir / "images" / "train"
    labels_dir = output_dir / "labels" / "train"
    images_dir.mkdir(parents=True, exist_ok=True)
    labels_dir.mkdir(parents=True, exist_ok=True)

    # List all label files from GCS
    print("Listing files from GCS...")
    label_blobs = list(bucket.list_blobs(prefix="training_data/labels/"))
    label_files = [(b.name, b) for b in label_blobs if b.name.endswith('.txt')]

    # Build dict of available images for quick lookup
    image_blobs = {b.name: b for b in bucket.list_blobs(prefix="training_data/images/")
                   if b.name.endswith('.jpg')}

    downloaded = 0
    skipped = 0
    errors = []

    for label_path, label_blob in label_files:
        if max_samples and downloaded >= max_samples:
            break

        # Extract image_id: training_data/labels/{uuid}.txt -> {uuid}
        image_id = label_path.replace("training_data/labels/", "").replace(".txt", "")
        image_path = f"training_data/images/{image_id}.jpg"

        # Check if corresponding image exists
        if image_path not in image_blobs:
            skipped += 1
            continue

        try:
            # Download image
            local_image_path = images_dir / f"{image_id}.jpg"
            image_blobs[image_path].download_to_filename(str(local_image_path))

            # Download label
            local_label_path = labels_dir / f"{image_id}.txt"
            label_blob.download_to_filename(str(local_label_path))

            downloaded += 1
            if downloaded % 100 == 0:
                print(f"  Downloaded {downloaded} samples...")

        except Exception as e:
            errors.append({"image_id": image_id, "error": str(e)})
            print(f"  Error downloading {image_id}: {e}")

    print(f"\nDownload complete:")
    print(f"  Downloaded: {downloaded}")
    print(f"  Skipped: {skipped}")
    print(f"  Errors: {len(errors)}")

    return {
        "status": "success",
        "downloaded": downloaded,
        "skipped": skipped,
        "errors": errors,
        "output_dir": str(output_dir)
    }


def create_dataset_split(output_dir: Path, val_ratio: float = 0.15):
    """
    Split downloaded data into train/val sets.
    YOLO expects: images/train, images/val, labels/train, labels/val
    """
    import random

    images_train = output_dir / "images" / "train"
    labels_train = output_dir / "labels" / "train"
    images_val = output_dir / "images" / "val"
    labels_val = output_dir / "labels" / "val"

    images_val.mkdir(parents=True, exist_ok=True)
    labels_val.mkdir(parents=True, exist_ok=True)

    # Get all image files
    image_files = list(images_train.glob("*.jpg"))
    random.shuffle(image_files)

    # Calculate split
    val_count = int(len(image_files) * val_ratio)
    val_files = image_files[:val_count]

    print(f"Splitting data: {len(image_files) - val_count} train, {val_count} val")

    # Move validation files
    for img_path in val_files:
        image_id = img_path.stem

        # Move image
        new_img_path = images_val / img_path.name
        img_path.rename(new_img_path)

        # Move label
        label_path = labels_train / f"{image_id}.txt"
        if label_path.exists():
            new_label_path = labels_val / f"{image_id}.txt"
            label_path.rename(new_label_path)

    print("Dataset split complete.")


def main():
    parser = argparse.ArgumentParser(description="Download feedback data from Firebase")
    parser.add_argument("--output-dir", type=str, default="./feedback_dataset",
                        help="Output directory for downloaded data")
    parser.add_argument("--min-samples", type=int, default=0,
                        help="Minimum samples required to proceed with download")
    parser.add_argument("--max-samples", type=int, default=None,
                        help="Maximum samples to download (for testing)")
    parser.add_argument("--credentials", type=str, default="../cloud_service/serviceAccountKey.json",
                        help="Path to Firebase service account JSON")
    parser.add_argument("--bucket", type=str, default="retrain_smart_waste_model",
                        help="Firebase Storage bucket name")
    parser.add_argument("--val-ratio", type=float, default=0.15,
                        help="Validation set ratio (default 0.15)")
    parser.add_argument("--check-only", action="store_true",
                        help="Only check feedback count, don't download")

    args = parser.parse_args()

    # Initialize Firebase
    print("Initializing Firebase...")
    initialize_firebase(credentials_path=args.credentials)

    if args.check_only:
        bucket = storage.bucket(args.bucket)
        stats = get_training_data_count(bucket)
        print(f"\nGCS Bucket: {args.bucket}")
        print(f"  Images: {stats['total_images']}")
        print(f"  Labels: {stats['total_labels']}")
        print(f"  Valid pairs (ready for training): {stats['valid_pairs']}")
        return

    # Download data
    output_dir = Path(args.output_dir)
    print(f"Downloading to: {output_dir}")

    result = download_training_data(
        bucket_name=args.bucket,
        output_dir=output_dir,
        min_samples=args.min_samples,
        max_samples=args.max_samples
    )

    if result["status"] == "success" and result["downloaded"] > 0:
        # Split into train/val
        create_dataset_split(output_dir, val_ratio=args.val_ratio)

        # Save metadata
        metadata = {
            "downloaded_at": datetime.utcnow().isoformat(),
            "total_samples": result["downloaded"],
            "val_ratio": args.val_ratio,
            "bucket": args.bucket
        }
        with open(output_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        print(f"\nDataset ready at: {output_dir}")
    else:
        print("\nDownload did not complete successfully.")


if __name__ == "__main__":
    main()
