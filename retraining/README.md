# Model Retraining Pipeline

This directory contains scripts and notebooks for fine-tuning the YOLO waste classification model using user feedback data.

## Overview

The pipeline:
1. Downloads user-corrected images and labels from Firebase Storage
2. Fine-tunes the existing model (incremental learning, not from scratch)
3. Produces improved weights that can be deployed to Cloud Run

## Prerequisites

- Python 3.9+
- Firebase service account credentials (`serviceAccountKey.json`)
- Current model weights (`best.pt`)
- Kaggle account (for GPU training)

## Files

| File | Description |
|------|-------------|
| `check_feedback_count.py` | Quick check if enough samples are available |
| `download_feedback_data.py` | Download training data from Firebase Storage |
| `retrain_model.py` | Local fine-tuning script |
| `kaggle_retrain_notebook.ipynb` | Kaggle notebook for GPU training |
| `dataset.yaml` | YOLO dataset configuration template |

## Quick Start

### 1. Check if you have enough feedback data

```bash
cd retraining
python check_feedback_count.py --threshold 1000
```

### 2. Option A: Train on Kaggle (Recommended)

Kaggle provides free GPU access (P100), which is much faster than CPU training.

**Setup:**

1. Go to [kaggle.com](https://kaggle.com) and create an account
2. Go to **Settings > Secrets** and add a new secret:
   - Name: `FIREBASE_CREDENTIALS`
   - Value: Contents of your `serviceAccountKey.json` file
3. Create a new **Dataset** and upload your current `best.pt` weights
4. Create a new **Notebook** and upload `kaggle_retrain_notebook.ipynb`
5. Enable **GPU accelerator** (Settings > Accelerator > GPU P100)
6. Run all cells

**After training:**
1. Download `best.pt` from the notebook's Output tab
2. Replace `cloud_service/build_context/weights/best.pt`
3. Rebuild and redeploy to Cloud Run

### 2. Option B: Train Locally

If you have a GPU or want to test with a small dataset:

```bash
# Install dependencies
pip install -r requirements.txt

# Download feedback data
python download_feedback_data.py \
    --output-dir ./feedback_dataset \
    --credentials ../cloud_service/serviceAccountKey.json \
    --min-samples 100

# Run fine-tuning
python retrain_model.py \
    --base-weights ../ml/weights/best.pt \
    --dataset ./feedback_dataset \
    --epochs 50 \
    --batch-size 16
```

## Training Strategy

### Why Fine-tuning (not training from scratch)?

- **Preserves learned features**: The model already knows how to detect waste
- **Faster**: Only needs 50 epochs vs 300+ for from-scratch training
- **Better with small data**: Works well even with 1000-5000 new samples
- **Less risk**: Lower chance of catastrophic forgetting

### Hyperparameters

| Parameter | Value | Reason |
|-----------|-------|--------|
| Learning Rate | 0.001 | Lower than usual to preserve features |
| Freeze Layers | 10 | Keeps backbone stable |
| Epochs | 50 | Sufficient for fine-tuning |
| Batch Size | 16 | Fits on most GPUs |
| Patience | 15 | Early stopping to prevent overfitting |

## Data Flow

```
Google Cloud Storage (GCS)
Bucket: gs://retrain_smart_waste_model
├── training_data/
│   ├── images/{uuid}.jpg    ← Original photos from app
│   └── labels/{uuid}.txt    ← YOLO format labels from feedback

                    ↓ download_feedback_data.py (uses GCS API via Firebase Admin SDK)

Local/Kaggle Dataset
├── images/
│   ├── train/
│   └── val/
└── labels/
    ├── train/
    └── val/

                    ↓ retrain_model.py / Kaggle notebook

New Weights
└── training_output/fine_tune/weights/best.pt

                    ↓ Manual deployment

Cloud Run
└── cloud_service/build_context/weights/best.pt
```

## GCS Bucket Structure

The training data is stored in Google Cloud Storage bucket `retrain_smart_waste_model`:

```
gs://retrain_smart_waste_model/
├── training_data/           ← PENDING: New data waiting to be trained
│   ├── images/
│   │   ├── {uuid1}.jpg
│   │   └── ...
│   └── labels/
│       ├── {uuid1}.txt
│       └── ...
│
├── trained_data/            ← COMPLETED: Already used for training
│   ├── 20240115_143052/     ← Timestamped batch
│   │   ├── images/
│   │   └── labels/
│   ├── 20240220_091530/     ← Another training run
│   │   ├── images/
│   │   └── labels/
│   └── ...
│
└── models/                  ← (Optional) Store trained weights here
    ├── best_latest.pt
    └── fine_tuned/
        └── best_20240115_143052.pt
```

**Data Flow:**
1. App uploads images → `training_data/images/`
2. User feedback creates labels → `training_data/labels/`
3. After training, files move → `trained_data/{timestamp}/`

This ensures you never train on the same data twice and can track training history.

The Firebase Admin SDK provides access to GCS buckets using the service account credentials.

## YOLO Label Format

Labels are stored in YOLO format (normalized coordinates):

```
<class_id> <x_center> <y_center> <width> <height>
```

Where:
- `class_id`: 0=glass, 1=paper, 2=cardboard, 3=plastic, 4=metal, 5=trash
- All coordinates are normalized to 0-1 range

Example:
```
3 0.45 0.62 0.15 0.23
4 0.78 0.31 0.08 0.12
```

## Deployment After Training

1. Copy new weights:
   ```bash
   cp training_output/fine_tune/weights/best.pt ../cloud_service/build_context/weights/best.pt
   ```

2. Update model version in `shared/model_meta.json`:
   ```json
   {
     "version": "v3-finetuned-YYYYMMDD"
   }
   ```

3. Rebuild and deploy:
   ```bash
   cd ../cloud_service
   gcloud run deploy waste-classifier-eu \
     --source . \
     --region europe-west1
   ```

## Troubleshooting

### "Not enough samples"
- Wait for more users to provide feedback
- Lower the threshold for testing (not recommended for production)

### Out of Memory (OOM) on GPU
- Reduce batch size: `--batch-size 8`
- Use a smaller image size: `--img-size 416`

### Training doesn't improve
- Check label quality in Firebase console
- Ensure labels are in correct YOLO format
- Try unfreezing more layers: `--freeze 5`

### Firebase auth errors on Kaggle
- Verify the secret name is exactly `FIREBASE_CREDENTIALS`
- Ensure the JSON is valid (no extra whitespace)
