"""
Quick utility to check training data count in GCS bucket.

This lists files directly from the GCS bucket (not Firestore).

Usage:
    python check_feedback_count.py [--credentials ../cloud_service/serviceAccountKey.json]
"""

import argparse
import firebase_admin
from firebase_admin import credentials, storage


def get_training_data_count(bucket) -> dict:
    """
    Count training samples by listing files directly from GCS bucket.
    Returns dict with image count, label count, and valid pairs.
    """
    # List all label files
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


def main():
    parser = argparse.ArgumentParser(description="Check training data count in GCS bucket")
    parser.add_argument("--credentials", type=str,
                        default="../cloud_service/serviceAccountKey.json",
                        help="Path to Firebase/GCP service account JSON")
    parser.add_argument("--bucket", type=str, default="retrain_smart_waste_model",
                        help="GCS bucket name")
    parser.add_argument("--threshold", type=int, default=1000,
                        help="Minimum samples required for training")
    args = parser.parse_args()

    # Initialize Firebase (provides GCS access)
    if not firebase_admin._apps:
        cred = credentials.Certificate(args.credentials)
        firebase_admin.initialize_app(cred)

    bucket = storage.bucket(args.bucket)

    # Count files directly from GCS
    print("Scanning GCS bucket...")
    stats = get_training_data_count(bucket)

    print(f"\n{'='*50}")
    print(f"GCS BUCKET: gs://{args.bucket}")
    print(f"{'='*50}")
    print(f"Images in training_data/images/:  {stats['total_images']}")
    print(f"Labels in training_data/labels/:  {stats['total_labels']}")
    print(f"Valid image+label pairs:          {stats['valid_pairs']}")
    print(f"{'='*50}")
    print(f"Required for training:            {args.threshold}")
    print(f"{'='*50}")

    if stats['valid_pairs'] >= args.threshold:
        print(f"READY FOR TRAINING!")
        print(f"You have {stats['valid_pairs'] - args.threshold} samples above threshold.")
    else:
        remaining = args.threshold - stats['valid_pairs']
        print(f"NOT READY - Need {remaining} more labeled samples.")

    print(f"{'='*50}\n")

    return stats['valid_pairs'] >= args.threshold


if __name__ == "__main__":
    import sys
    ready = main()
    sys.exit(0 if ready else 1)
