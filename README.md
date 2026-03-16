# Smart Waste Sorter

A full-stack waste classification and recycling app that uses AI to identify waste items from photos, guide users to nearby recycling centers, and continuously improve its model through user feedback.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
   - [Frontend (React Native)](#frontend-react-native)
   - [Backend (Local Flask Dev)](#backend-local-flask-dev)
   - [Cloud Service (Google Cloud Run)](#cloud-service-google-cloud-run)
7. [Environment & Credentials](#environment--credentials)
8. [Key Features](#key-features)
9. [API Reference](#api-reference)
10. [Data Structures](#data-structures)
11. [Model Retraining](#model-retraining)
12. [Automated Retraining Pipeline](#automated-retraining-pipeline)
13. [Firebase & GCS Configuration](#firebase--gcs-configuration)
14. [Utilities](#utilities)
15. [Waste Categories](#waste-categories)

---

## Overview

Smart Waste Sorter allows users to photograph waste items and receive instant AI-powered classification. The app:

- Runs **YOLOv8 object detection** on Google Cloud Run to identify waste in photos
- Verifies the user's GPS location against nearby recycling centers and **awards points** for disposing of waste correctly
- Collects user feedback on model predictions (correct, wrong label, bad box) to build a labelled training dataset
- Runs a **continuous learning pipeline** that automatically retrains the model on Kaggle GPU infrastructure whenever enough feedback is collected
- Includes a **Community Review** screen where users can annotate unreviewed images to further improve the model

---

## Architecture

### Image Classification Flow

```
User captures photo
  └─► POST /predict (Cloud Run)
        ├─ Upload image to GCS (pending_images/)
        ├─ YOLOv8 inference
        └─ Return detections + annotated image (base64)

Frontend (ClassificationResultScreen)
  ├─ Display annotated image with SVG bounding-box overlay
  ├─ User can draw extra boxes (PanResponder)
  └─ User validates each detection: ✅ Correct | ❌ Wrong label | 👻 Bad box

On Submit
  └─► POST /feedback (location_verified: false)
        └─ Generate YOLO labels → move image to training_data/

  ├─ verifyLocationForRecycling() runs in parallel per unique waste class
  └─ If GPS within 25 m of a center → POST /feedback again (location_verified: true)
       └─ Backend awards points, frontend saves one Firestore doc per unique class
```

### Community Review Flow

```
CommunityReviewScreen
  └─► GET /pending-images  (up to 10 unreviewed images)
User annotates each image (draw boxes + assign class)
  └─► POST /community-feedback  (saves YOLO labels)
  └─► DELETE /pending-images/<id>
```

### Component Relationships

| Component | Responsibility |
|---|---|
| `AuthContext.tsx` | Global auth state + real-time Firestore profile sync (`onSnapshot`) |
| `AppNavigator.tsx` | Conditional stack (Unauthorized / Authorized) based on Firebase auth |
| `ClassificationResultScreen.tsx` | SVG overlay, box drawing, feedback list, location modal |
| `PredictionFeedbackList.tsx` | Per-detection validation cards + label correction modal |
| `LocationVerificationCard.tsx` | 5-state location UI (loading / verified / not-verified / no-centers / error) |
| `CommunityReviewScreen.tsx` | Annotation UI for pending images |
| `locationVerificationService.ts` | Haversine distance check, 25 m radius, ML label → center type mapping |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo SDK 54) + TypeScript |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| Navigation | React Navigation v7 (Native Stack) |
| Auth & Database | Firebase Auth + Cloud Firestore |
| Storage | Google Cloud Storage (GCS) |
| ML Backend | Flask + YOLOv8 (Ultralytics) on Google Cloud Run |
| Model Training | Kaggle GPU (P100) via Kaggle API |
| CI/CD | Google Cloud Build triggered by Cloud Function |
| Orchestration | Google Cloud Functions (Gen 2) + Cloud Scheduler |

---

## Project Structure

```
Final-Project/
├── frontend/MyApp/                         # React Native Expo app
│   ├── src/
│   │   ├── screens/
│   │   │   ├── ClassificationResultScreen.tsx   # Core scan + feedback screen
│   │   │   ├── ClassificationHistoryScreen.tsx  # Scan history with points
│   │   │   ├── CommunityReviewScreen.tsx         # "Help Us Improve" annotation
│   │   │   ├── HomeScreen.tsx                    # Dashboard with real-time stats
│   │   │   ├── RecyclingCentersScreen.tsx        # OSM map + filters
│   │   │   └── ...                               # Login, Register, Profile, Rewards
│   │   ├── components/
│   │   │   ├── PredictionFeedbackList.tsx        # Detection validation cards
│   │   │   └── LocationVerificationCard.tsx      # Location check UI
│   │   ├── context/
│   │   │   └── AuthContext.tsx                   # Auth state + Firestore listener
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx
│   │   ├── services/
│   │   │   └── locationVerificationService.ts    # GPS + recycling center logic
│   │   ├── types.ts                              # TypeScript interfaces + nav types
│   │   └── firebaseConfig.ts                     # Firebase SDK initialization
│   ├── app.json                                  # Expo configuration
│   └── package.json
│
├── cloud_service/                          # Production ML backend (Cloud Run)
│   ├── build_context/
│   │   ├── main.py                         # Flask API endpoints
│   │   ├── prediction_service.py           # YOLOv8 inference wrapper
│   │   ├── Dockerfile                      # Python 3.9-slim container
│   │   ├── weights/best.pt                 # Trained YOLO model weights
│   │   └── shared/                         # Copied from root /shared
│   ├── deploy.ps1                          # Cloud Run deployment script
│   └── build_local.ps1                     # Local Docker build & test
│
├── backend/                                # Local dev Flask server (mirrors cloud_service)
│   ├── main.py
│   ├── serviceAccountKey.json              # Firebase credentials (not in git)
│   └── requirements.txt
│
├── ml/
│   ├── prediction_service.py               # Core inference logic
│   ├── weights/best.pt                     # Master model weights
│   └── make_yolo_det_from_class.py         # Label format converter
│
├── shared/
│   ├── class_map.json                      # Waste category name ↔ class ID mappings
│   └── model_meta.json                     # Model version metadata
│
├── retraining/
│   ├── kaggle_retrain_notebook.ipynb       # GPU fine-tuning notebook (Kaggle P100)
│   ├── retrain_model.py                    # Local fine-tuning script
│   ├── download_feedback_data.py           # Download labelled data from GCS
│   ├── check_feedback_count.py             # Verify ≥ 1000 sample threshold
│   ├── dataset.yaml                        # YOLO dataset configuration
│   ├── requirements.txt
│   └── cloud_orchestrator/                 # Fully automated retraining pipeline
│       ├── main.py                         # Cloud Function entry point
│       ├── deploy.ps1                      # Deploy Function + Scheduler
│       └── requirements.txt
│
└── utilities/
    ├── upload_recycling_centers.py         # Sync recycling centers → Firestore
    ├── upload_rewards.py                   # Sync rewards catalog → Firestore
    ├── recycling_centers.json              # Master recycling center data (814 KB)
    └── rewardsData.json                    # Master rewards catalog
```

---

## Prerequisites

Before starting, install the following tools:

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Frontend JS runtime |
| [npm](https://www.npmjs.com/) | 9+ | Package manager |
| [Expo CLI](https://docs.expo.dev/get-started/installation/) | Latest | React Native development |
| [Python](https://www.python.org/) | 3.9+ | Backend / retraining scripts |
| [Docker](https://www.docker.com/) | Latest | Local Cloud Run testing |
| [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) | Latest | Cloud Run deployment |
| [Android Studio](https://developer.android.com/studio) | Latest | Android emulator (optional) |
| [Xcode](https://developer.apple.com/xcode/) | 14+ | iOS simulator (macOS only) |

---

## Installation & Setup

### Frontend (React Native)

```bash
# 1. Navigate to the app directory
cd frontend/MyApp

# 2. Install all dependencies
npm install

# 3. Start the Expo development server
npm start
```

After running `npm start`, a QR code will appear. Scan it with the **Expo Go** app on your phone, or press:
- `a` to open on a connected Android device / emulator
- `i` to open on iOS simulator (macOS only)
- `w` to open in browser (limited functionality)

**Key dependencies installed automatically:**

| Package | Purpose |
|---|---|
| `expo` (~54) | Managed workflow runtime |
| `react-native` (0.81) | Core mobile framework |
| `nativewind` v4 + `tailwindcss` | Utility-first styling |
| `@react-navigation/native-stack` | Screen navigation |
| `firebase` v12 | Auth, Firestore, real-time sync |
| `expo-camera` / `expo-image-picker` | Camera + gallery access |
| `expo-location` | GPS for recycling center verification |
| `react-native-svg` | SVG bounding-box overlay on scan results |
| `react-native-maps` | Recycling centers map |
| `react-native-toast-message` | Global toast notifications |
| `react-native-keyboard-aware-scroll-view` | Keyboard-friendly forms |
| `@gorhom/bottom-sheet` | Bottom sheet modals |
| `react-hook-form` + `zod` | Form validation |

> **Note:** If you are building a native binary (not just Expo Go), run `npx expo prebuild` first to generate the `android/` and `ios/` native project folders.

---

### Backend (Local Flask Dev)

The `backend/` folder is a local mirror of the cloud service, useful for development without Docker.

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
.venv\Scripts\activate           # Windows

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Place your Firebase service account key
# Copy serviceAccountKey.json into backend/

# 5. Start the dev server (runs on http://localhost:8000)
python main.py
```

---

### Cloud Service (Google Cloud Run)

The production backend lives in `cloud_service/build_context/` and runs in Docker on Cloud Run.

**Local Docker build & test:**

```bash
cd cloud_service
.\build_local.ps1
```

**Deploy to Cloud Run:**

```bash
cd cloud_service
.\deploy.ps1
```

Or manually with `gcloud`:

```bash
gcloud run deploy waste-classifier-eu \
  --source ./cloud_service/build_context \
  --project smart-waste-sorter \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi
```

---

## Environment & Credentials

### Firebase Service Account

Required for the backend to access Firestore and GCS.

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Save the file as:
   - `backend/serviceAccountKey.json` (local dev)
   - `cloud_service/build_context/serviceAccountKey.json` (Docker / Cloud Run)

> These files are listed in `.gitignore` — never commit them.

### Frontend Firebase Config

Firebase is initialized in `frontend/MyApp/src/firebaseConfig.ts`. The config object (API key, project ID, etc.) comes from your Firebase project's web app settings.

**Firebase project used:** `ai-waste-sorter-a22c1`

### Kaggle API (for retraining)

Place your Kaggle API credentials in `retraining/KaggleAPI.txt` (also gitignored). The cloud orchestrator reads the key from **Google Secret Manager** under the secret name `kaggle-api-key`.

---

## Key Features

### 1. AI Waste Classification
- User takes a photo; it is uploaded to GCS and run through YOLOv8
- The annotated image (bounding boxes already drawn by the model) is returned as base64
- Multiple waste objects can be detected in a single photo

### 2. Interactive Feedback
- Users can validate each detection: confirm correct, correct the label, or mark as a bad box ("ghost")
- Users can draw additional bounding boxes on the image using touch gestures
- All validated/corrected feedback is converted to YOLO label format and stored in GCS for retraining

### 3. Location-Based Points
- The app checks the user's GPS against nearby recycling centers (within 25 m)
- If the user is at an appropriate center for the detected waste type, points are awarded:

| Waste Type | Points |
|---|---|
| Glass | 25 |
| Metal | 20 |
| Plastic | 15 |
| Paper / Cardboard | 10 |
| Trash | 5 |

- Points update instantly in the UI via a Firestore `onSnapshot` listener

### 4. Community Review
- Admin or volunteer users can access the "Help Us Improve" screen
- Unreviewed images (in `pending_images/` GCS folder) are fetched and displayed
- Users draw bounding boxes and assign classes; annotations are saved as YOLO labels

### 5. Recycling Centers Map
- Interactive OSM-based map showing nearby recycling centers
- Filter by waste type
- Tap a center to get directions; centers are crowd-sourced and stored in Firestore

### 6. Rewards System
- Accumulated points can be redeemed for rewards
- Reward catalog is managed in Firestore via `utilities/upload_rewards.py`

---

## API Reference

Base URL (production): `https://waste-classifier-eu-<hash>-ew.a.run.app`

### `POST /predict`
Upload an image for classification.

**Request:** `multipart/form-data` with field `image`

**Response:**
```json
{
  "prediction": "plastic",
  "confidence": 0.91,
  "tips": "Rinse and place in plastic recycling bin.",
  "image_id": "uuid-string",
  "annotated_image_base64": "data:image/jpeg;base64,...",
  "detections": [
    {
      "id": "det_0",
      "label": "plastic",
      "confidence": 0.91,
      "box_2d": [0.45, 0.62, 0.15, 0.23]
    }
  ],
  "found": true
}
```

### `POST /feedback`
Submit user corrections for a prediction.

**Request body:**
```json
{
  "image_id": "uuid-string",
  "user_id": "firebase-uid",
  "location_verified": false,
  "feedback": [
    {
      "detectionId": "det_0",
      "originalLabel": "plastic",
      "status": "correct",
      "box_2d": [0.45, 0.62, 0.15, 0.23]
    }
  ]
}
```

**Notes:**
- `status` can be `"correct"`, `"wrong_label"`, or `"ghost"`
- `"ghost"` boxes are excluded from YOLO labels
- If `location_verified: true`, points are awarded to the user in Firestore
- User-drawn boxes have `detectionId` prefixed with `"user_"`

### `GET /pending-images`
Returns up to 10 unreviewed images from `pending_images/` in GCS.

### `POST /community-feedback`
Save community annotations (same format as `/feedback`).

### `DELETE /pending-images/<id>`
Remove an image from the pending review queue.

### `GET /health`
Health check — returns `{"status": "ok"}`.

---

## Data Structures

### UserProfile (Firestore `users/{uid}`)
```typescript
{
  email: string
  fullName: string
  role: "admin" | "user"
  points: number
  itemsScanned: number
  rewardsRedeemed: number
  createdAt: string
  lastLoginTimestamp?: number
}
```

### Scan History Entry (Firestore `scans/{uid}/results/{docId}`)
```typescript
{
  class_name: string           // Effective class after corrections
  timestamp: Timestamp
  points: number               // Points actually awarded (0 if not location-verified)
  potential_points: number     // Max points if user visits a center
  location_verified: boolean
  image_id: string
  nearest_center: { id, name, latitude, longitude } | null
  distance_meters: number | null
}
```
One document is saved **per unique waste class** found in a single scan.

### YOLO Label Format (`training_data/labels/{uuid}.txt`)
```
<class_id> <x_center> <y_center> <width> <height>
3 0.45 0.62 0.15 0.23    # plastic
4 0.78 0.31 0.08 0.12    # metal
```
All coordinates are normalized to [0, 1].

---

## Model Retraining

### Manual Retraining

```bash
cd retraining

# 1. Check if enough feedback has been collected (requires 1000+ samples)
python check_feedback_count.py --threshold 1000

# 2. Download labelled images from GCS
python download_feedback_data.py \
  --output-dir ./feedback_dataset \
  --credentials ../cloud_service/serviceAccountKey.json \
  --min-samples 100

# 3a. Fine-tune locally (requires GPU)
python retrain_model.py \
  --base-weights ../ml/weights/best.pt \
  --dataset ./feedback_dataset \
  --epochs 50 \
  --batch-size 16

# 3b. Or run the Kaggle GPU notebook (recommended — free P100)
#     Open kaggle_retrain_notebook.ipynb in Kaggle

# 4. Copy new weights
cp <training-output>/weights/best.pt ../cloud_service/build_context/weights/best.pt

# 5. Update model version
# Edit shared/model_meta.json with new version string

# 6. Redeploy Cloud Run
cd ../cloud_service && .\deploy.ps1
```

> **Important:** Always fine-tune from existing weights (`--base-weights`). Never train from scratch.

---

## Automated Retraining Pipeline

The `retraining/cloud_orchestrator/` folder contains a **Google Cloud Function** that automates the entire retraining cycle.

### How It Works

1. **Cloud Scheduler** triggers the function every 3 days at 02:00 UTC
2. **Count samples** — checks `training_data/` in GCS for ≥ 1000 valid image+label pairs
3. **Trigger Kaggle** — reads `notebook/kaggle_retrain_notebook.ipynb` from GCS and pushes a new kernel version to Kaggle via API (starts GPU run automatically)
4. **Poll completion** — polls Kaggle every 15 minutes, up to 1 hour
5. **Verify improvement** — reads `models/training_status.json` written by the notebook to GCS; checks `improved: true` and compares mAP50 scores
6. **Trigger Cloud Build** — if improved, fires the Cloud Build trigger to rebuild and redeploy the Cloud Run service with new weights

### Deploy the Orchestrator

```bash
cd retraining/cloud_orchestrator
.\deploy.ps1
```

### Manually Trigger (Testing)

```bash
gcloud functions call retrain-orchestrator \
  --region=europe-west1 \
  --project=smart-waste-sorter
```

### GCS Paths Used

| Path | Purpose |
|---|---|
| `notebook/kaggle_retrain_notebook.ipynb` | Notebook pushed to Kaggle |
| `models/training_status.json` | Training result written by notebook |
| `training_data/images/` | Training images |
| `training_data/labels/` | YOLO label files |
| `trained_data/{timestamp}/` | Archived batches after training |
| `pending_images/` | New uploads awaiting feedback |

### Production vs Testing Constants

The orchestrator has reduced constants for testing. **Restore before going live:**

| Constant | Testing | Production |
|---|---|---|
| `MIN_SAMPLES` | 35 | 1000 |
| `POLL_INTERVAL_SEC` | 60 | 900 |
| `MAX_WAIT_SEC` | 600 | 3600 |

---

## Firebase & GCS Configuration

| Resource | Value |
|---|---|
| Firebase Project | `ai-waste-sorter-a22c1` |
| GCS Bucket | `retrain_smart_waste_model` |
| Cloud Run Region | `europe-west1` |
| GCP Project | `smart-waste-sorter` |
| Cloud Build Trigger ID | `036930df-ed00-4a24-913e-03ca0c6e1e36` |
| Kaggle Kernel | `omriasidon/retrainning-waste-classification-model` |

**Session Management:**
- Sessions expire after **2 hours** (configured in `AuthContext.tsx`)
- Expiry is checked on each app foreground event via `AppState` listener
- `lastLoginTimestamp` is persisted in `AsyncStorage`

---

## Utilities

### Upload Recycling Centers to Firestore

```bash
cd utilities
python upload_recycling_centers.py
```

Reads `recycling_centers.json` (814 KB, 800+ centers) and syncs to Firestore.

### Upload Rewards Catalog

```bash
cd utilities
python upload_rewards.py
```

Reads `rewardsData.json` and syncs to Firestore.

---

## Waste Categories

| Class ID | Name | Points |
|---|---|---|
| 0 | glass | 25 |
| 1 | paper | 10 |
| 2 | cardboard | 10 |
| 3 | plastic | 15 |
| 4 | metal | 20 |
| 5 | trash | 5 |

Class mappings are defined in `shared/class_map.json` and must stay in sync between the frontend, backend, and YOLO training config (`retraining/dataset.yaml`).
