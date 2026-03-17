"""
Model Retraining Script for Waste Classification

This script fine-tunes the existing YOLO model using user feedback data.
It can be run locally or adapted for Kaggle.

Key Features:
- Fine-tunes from existing weights (no training from scratch)
- Uses lower learning rate to preserve learned features
- Supports mixed dataset (original + feedback data)
- Saves best and last checkpoints

Usage:
    python retrain_model.py --base-weights ./best.pt --dataset ./feedback_dataset --epochs 50
"""

import os
import json
import argparse
import shutil
from pathlib import Path
from datetime import datetime

from ultralytics import YOLO


def validate_dataset(dataset_path: Path) -> dict:
    """Validate that the dataset structure is correct for YOLO training."""
    issues = []

    # Check required directories
    required_dirs = [
        dataset_path / "images" / "train",
        dataset_path / "labels" / "train",
    ]

    for d in required_dirs:
        if not d.exists():
            issues.append(f"Missing directory: {d}")

    if issues:
        return {"valid": False, "issues": issues}

    # Count samples
    train_images = list((dataset_path / "images" / "train").glob("*.jpg"))
    train_labels = list((dataset_path / "labels" / "train").glob("*.txt"))

    val_images_dir = dataset_path / "images" / "val"
    val_images = list(val_images_dir.glob("*.jpg")) if val_images_dir.exists() else []

    return {
        "valid": True,
        "train_images": len(train_images),
        "train_labels": len(train_labels),
        "val_images": len(val_images),
    }


def create_dataset_yaml(dataset_path: Path, output_path: Path = None) -> Path:
    """Create a YOLO dataset.yaml file for the feedback dataset."""
    if output_path is None:
        output_path = dataset_path / "dataset.yaml"

    config = {
        "path": str(dataset_path.absolute()),
        "train": "images/train",
        "val": "images/val" if (dataset_path / "images" / "val").exists() else "images/train",
        "nc": 6,
        "names": {
            0: "glass",
            1: "paper",
            2: "cardboard",
            3: "plastic",
            4: "metal",
            5: "trash"
        }
    }

    # Write as YAML
    yaml_content = f"""# Auto-generated dataset config
path: {config['path']}
train: {config['train']}
val: {config['val']}

nc: {config['nc']}

names:
  0: glass
  1: paper
  2: cardboard
  3: plastic
  4: metal
  5: trash
"""
    with open(output_path, 'w') as f:
        f.write(yaml_content)

    print(f"Dataset config saved to: {output_path}")
    return output_path


def fine_tune_model(
    base_weights: Path,
    dataset_yaml: Path,
    output_dir: Path,
    epochs: int = 50,
    batch_size: int = 16,
    img_size: int = 640,
    learning_rate: float = 0.001,  # Lower LR for fine-tuning
    freeze_layers: int = 10,  # Freeze early layers to preserve features
    device: str = "auto"
) -> dict:
    """
    Fine-tune the YOLO model on feedback data.

    Args:
        base_weights: Path to existing model weights (best.pt)
        dataset_yaml: Path to dataset configuration
        output_dir: Where to save training results
        epochs: Number of training epochs
        batch_size: Batch size (adjust based on GPU memory)
        img_size: Image size for training
        learning_rate: Initial learning rate (lower for fine-tuning)
        freeze_layers: Number of layers to freeze (preserves learned features)
        device: 'auto', 'cpu', '0' (GPU 0), etc.

    Returns:
        dict with training results and paths to new weights
    """
    print(f"\n{'='*60}")
    print("YOLO FINE-TUNING")
    print(f"{'='*60}")
    print(f"Base weights: {base_weights}")
    print(f"Dataset: {dataset_yaml}")
    print(f"Epochs: {epochs}")
    print(f"Batch size: {batch_size}")
    print(f"Learning rate: {learning_rate}")
    print(f"Freeze layers: {freeze_layers}")
    print(f"{'='*60}\n")

    # Load the pre-trained model
    model = YOLO(str(base_weights))

    # Start fine-tuning
    # Key settings for fine-tuning:
    # - Lower lr0 (initial LR) to avoid destroying learned features
    # - freeze parameter to keep backbone stable
    # - patience for early stopping
    results = model.train(
        data=str(dataset_yaml),
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        lr0=learning_rate,
        lrf=0.01,  # Final LR = lr0 * lrf
        freeze=freeze_layers,
        patience=15,  # Early stopping patience
        save=True,
        save_period=10,  # Save checkpoint every N epochs
        project=str(output_dir),
        name="fine_tune",
        exist_ok=True,
        pretrained=True,
        optimizer="AdamW",
        weight_decay=0.0005,
        warmup_epochs=3,
        warmup_momentum=0.8,
        device=device,
        verbose=True,
    )

    # Get paths to saved weights
    run_dir = output_dir / "fine_tune"
    best_weights = run_dir / "weights" / "best.pt"
    last_weights = run_dir / "weights" / "last.pt"

    # Generate training summary
    summary = {
        "completed_at": datetime.utcnow().isoformat(),
        "epochs_requested": epochs,
        "base_weights": str(base_weights),
        "dataset": str(dataset_yaml),
        "best_weights": str(best_weights) if best_weights.exists() else None,
        "last_weights": str(last_weights) if last_weights.exists() else None,
        "training_params": {
            "batch_size": batch_size,
            "img_size": img_size,
            "learning_rate": learning_rate,
            "freeze_layers": freeze_layers
        }
    }

    # Save summary
    summary_path = run_dir / "training_summary.json"
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)

    print(f"\n{'='*60}")
    print("TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"Best weights: {best_weights}")
    print(f"Summary: {summary_path}")
    print(f"{'='*60}\n")

    return summary


def main():
    parser = argparse.ArgumentParser(description="Fine-tune YOLO model on feedback data")
    parser.add_argument("--base-weights", type=str, required=True,
                        help="Path to base model weights (best.pt)")
    parser.add_argument("--dataset", type=str, required=True,
                        help="Path to feedback dataset directory")
    parser.add_argument("--output", type=str, default="./training_runs",
                        help="Output directory for training results")
    parser.add_argument("--epochs", type=int, default=50,
                        help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16,
                        help="Batch size")
    parser.add_argument("--img-size", type=int, default=640,
                        help="Image size")
    parser.add_argument("--lr", type=float, default=0.001,
                        help="Initial learning rate")
    parser.add_argument("--freeze", type=int, default=10,
                        help="Number of layers to freeze")
    parser.add_argument("--device", type=str, default="auto",
                        help="Device: 'auto', 'cpu', '0' (GPU)")
    parser.add_argument("--min-samples", type=int, default=1000,
                        help="Minimum training samples required (default: 1000)")
    parser.add_argument("--skip-threshold", action="store_true",
                        help="Skip minimum sample count check (for local testing)")

    args = parser.parse_args()

    # Validate paths
    base_weights = Path(args.base_weights)
    dataset_path = Path(args.dataset)
    output_dir = Path(args.output)

    if not base_weights.exists():
        print(f"Error: Base weights not found: {base_weights}")
        return

    if not dataset_path.exists():
        print(f"Error: Dataset not found: {dataset_path}")
        return

    # Validate dataset
    validation = validate_dataset(dataset_path)
    if not validation["valid"]:
        print("Dataset validation failed:")
        for issue in validation["issues"]:
            print(f"  - {issue}")
        return

    print(f"Dataset validation passed:")
    print(f"  Train images: {validation['train_images']}")
    print(f"  Train labels: {validation['train_labels']}")
    print(f"  Val images: {validation['val_images']}")

    # Check minimum sample threshold
    total_samples = validation['train_images']
    if not args.skip_threshold and total_samples < args.min_samples:
        print(f"\nError: Only {total_samples} training samples found, {args.min_samples} required.")
        print("Use --skip-threshold to override for local testing.")
        return
    elif args.skip_threshold and total_samples < args.min_samples:
        print(f"\nWarning: Only {total_samples} samples (threshold bypassed with --skip-threshold).")

    # Create dataset.yaml
    dataset_yaml = create_dataset_yaml(dataset_path)

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Run fine-tuning
    summary = fine_tune_model(
        base_weights=base_weights,
        dataset_yaml=dataset_yaml,
        output_dir=output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        img_size=args.img_size,
        learning_rate=args.lr,
        freeze_layers=args.freeze,
        device=args.device
    )

    print("Training complete!")
    print(f"New best weights: {summary.get('best_weights')}")


if __name__ == "__main__":
    main()
