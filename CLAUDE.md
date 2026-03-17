# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack waste classification and recycling app with mobile frontend (React Native), cloud ML service (YOLOv8 on Google Cloud Run), and continuous learning from user feedback.

**Tech Stack:**
- Frontend: React Native (Expo) + TypeScript + NativeWind (Tailwind CSS)
- Backend: Flask (Python) on Google Cloud Run
- ML: YOLOv8 (Ultralytics) for object detection
- Infrastructure: Firebase Auth + Firestore + Google Cloud Storage

**Waste Categories:** glass (0), paper (1), cardboard (2), plastic (3), metal (4), trash (5)

## Development Commands

### Frontend (React Native Expo)
```bash
cd frontend/MyApp
npm install
npm start           # Start Expo dev server
npm run android     # Build for Android
npm run ios         # Build for iOS
```

### Backend (Local Flask Development)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py              # Dev server on localhost:8000
```

### Cloud Service (Docker)
```bash
# Local build/test
cd cloud_service
.\build_local.ps1

# Deploy to Cloud Run
.\deploy.ps1
# Or manually:
gcloud run deploy waste-classifier-eu \
  --source ./build_context \
  --project smart-waste-sorter \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi
```

### Model Retraining (Manual)
```bash
# Check feedback count
cd retraining
python check_feedback_count.py --threshold 1000

# Download training data from GCS
python download_feedback_data.py \
  --output-dir ./feedback_dataset \
  --credentials ../cloud_service/serviceAccountKey.json \
  --min-samples 100

# Fine-tune model (local GPU)
python retrain_model.py \
  --base-weights ../ml/weights/best.pt \
  --dataset ./feedback_dataset \
  --epochs 50 \
  --batch-size 16

# Or use Kaggle GPU notebook: kaggle_retrain_notebook.ipynb
```

### Model Retraining (Automated — Cloud Orchestrator)
```bash
# Deploy Cloud Function + Cloud Scheduler (run once to set up):
bash retraining/cloud_orchestrator/deploy.sh

# Manually trigger the orchestrator for testing:
gcloud functions call retrain-orchestrator \
  --region=europe-west1 \
  --project=smart-waste-sorter
```
The Cloud Scheduler fires every 3 days at 02:00 UTC automatically.

### Data Upload Utilities
```bash
cd utilities
python upload_recycling_centers.py  # Sync recycling centers to Firestore
python upload_rewards.py            # Sync rewards catalog to Firestore
```

## Architecture

### Data Flow: Image Classification
```
User captures photo → Cloud Run /predict endpoint
  → Upload to GCS (pending_images/)
  → YOLOv8 inference (prediction_service.py)
  → Return PredictionResponse with detections + annotated_image_base64
→ Frontend (ClassificationResultScreen) displays annotated image with SVG overlay
→ User draws extra boxes on image (PanResponder) and assigns classes
→ User validates model detections (PredictionFeedbackList):
    ✅ Correct | ❌ Wrong label (pick correction) | 👻 Bad Box (ghost)
→ On submit: filter out ghosts, collect unique effective classes
→ Cloud Run /feedback endpoint (location_verified: false first)
  → Generate YOLO labels from feedback
  → Move image to training_data/
→ verifyLocationForRecycling() runs in parallel per unique class
→ If any class verified → re-submit with location_verified: true (backend awards points)
→ Save one Firestore entry per unique class (scans/{uid}/results)
→ Show LocationVerificationCard modal (single class) or multi-class summary modal
→ Firestore real-time listener updates user profile (points, itemsScanned)
```

### Data Flow: Community Review ("Help Us Improve")
```
CommunityReviewScreen → GET /pending-images
  → Fetch up to 10 unreviewed images from GCS
→ User draws annotation boxes + assigns classes on each image
→ POST /community-feedback → saves labels to training_data/
→ DELETE /pending-images/<id> → removes from pending queue
```

### Component Interaction
- **AuthContext.tsx**: Global auth state + user profile with real-time Firestore sync (onSnapshot)
- **AppNavigator.tsx**: Conditional stack (Unauthorized vs Authorized) based on Firebase auth state
- **Navigation**: React Navigation Native Stack with routes defined in `types.ts:RootStackParamList`
- **Session**: 2-hour expiry (configurable in AuthContext.tsx)
- **ClassificationResultScreen**: SVG bounding-box overlay (react-native-svg) with PanResponder for drawing; hosts PredictionFeedbackList and the location modal
- **PredictionFeedbackList**: Per-detection True/False/Bad-Box controls + label correction modal; user-drawn boxes show as simple cards with delete button
- **LocationVerificationCard**: 5 render states — loading, verified (green), not-verified (orange + "Take me there"), no-centers (gray), error (red + retry)
- **CommunityReviewScreen**: Fetches pending images, provides the same SVG drawing UI for annotation, posts community feedback to backend

### API Endpoints (Cloud Run)
```
POST /predict                 - Image → PredictionResponse
POST /feedback                - Save user feedback → YOLO labels
GET  /pending-images          - Fetch up to 10 pending images
POST /community-feedback      - Save community annotations
DELETE /pending-images/<id>   - Remove pending image
GET  /health                  - Service health check
```

### Firebase Configuration
- **Project ID**: ai-waste-sorter-a22c1
- **Auth**: Firebase Authentication (email/password)
- **Database**: Firestore with real-time listeners
- **Storage Bucket (GCS)**: retrain_smart_waste_model
  - `pending_images/` - New uploads awaiting feedback
  - `training_data/images/` - User-corrected images
  - `training_data/labels/` - YOLO format labels
  - `trained_data/{timestamp}/` - Archived training batches

### Key Data Structures

**UserProfile (Firestore `users/{uid}`):**
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

**Scan history entry (Firestore `scans/{uid}/results/{docId}`):**
```typescript
{
  class_name: string          // Effective class after user corrections
  timestamp: Timestamp
  points: number              // Points actually awarded (0 if not verified)
  potential_points: number    // Points that could be earned at a center
  location_verified: boolean
  image_id: string
  nearest_center: { id, name, latitude, longitude } | null
  distance_meters: number | null
}
```
One document is saved **per unique waste class** found in a single scan.

**PredictionResponse (API):**
```typescript
{
  prediction: string              // Primary class (e.g., "plastic")
  confidence: number              // 0.0-1.0
  tips: string                    // Recycling instructions
  image_id: string                // UUID for feedback
  annotated_image_base64?: string // Image with bboxes drawn by backend
  detections: DetectionItem[]     // All objects found
  found: boolean
}
```

**DetectionItem:**
```typescript
{
  id: string
  label: string
  confidence: number
  box_2d: number[]  // [x_center, y_center, width, height] normalized 0-1
}
```

**FeedbackData:**
```typescript
{
  detectionId: string
  originalLabel: string
  status: 'correct' | 'wrong_label' | 'ghost'
  correctedLabel?: string   // Required when status === 'wrong_label'
  box_2d?: number[]
}
```
User-drawn boxes always have `status: 'correct'` and `detectionId` prefixed with `'user_'`.

### YOLO Label Format
Stored in GCS at `training_data/labels/{uuid}.txt`:
```
<class_id> <x_center> <y_center> <width> <height>
3 0.45 0.62 0.15 0.23    # plastic
4 0.78 0.31 0.08 0.12    # metal
```
All coordinates normalized to [0, 1]. Class IDs from `shared/class_map.json`.

## Directory Structure

```
Final-Project/
├── frontend/MyApp/                    # React Native Expo app
│   ├── src/
│   │   ├── screens/
│   │   │   ├── ClassificationResultScreen.tsx  # SVG overlay, box drawing, feedback, location modal
│   │   │   ├── ClassificationHistoryScreen.tsx # Scan history (potential vs awarded pts, nav buttons)
│   │   │   ├── CommunityReviewScreen.tsx       # "Help Us Improve" - annotate pending images
│   │   │   ├── HomeScreen.tsx                  # Dynamic greeting, real-time stats, quick actions
│   │   │   ├── RecyclingCentersScreen.tsx      # OSM map, filters, crowd-sourced reporting
│   │   │   └── ...                             # Login, Register, Profile, Rewards, etc.
│   │   ├── components/
│   │   │   ├── PredictionFeedbackList.tsx      # Per-detection validation cards + label picker
│   │   │   └── LocationVerificationCard.tsx    # 5-state location verification UI card
│   │   ├── context/AuthContext.tsx    # Global auth state + user profile (onSnapshot)
│   │   ├── navigation/AppNavigator.tsx
│   │   ├── services/
│   │   │   └── locationVerificationService.ts  # Haversine distance, 25m radius, class→center mapping
│   │   ├── types.ts                   # TypeScript interfaces + RootStackParamList
│   │   └── firebaseConfig.ts          # Firebase initialization
│   └── package.json
│
├── cloud_service/
│   ├── build_context/                 # Docker build context for Cloud Run
│   │   ├── main.py                    # Flask API (predict, feedback endpoints)
│   │   ├── prediction_service.py      # YOLOv8 inference wrapper
│   │   ├── Dockerfile                 # Python 3.9-slim container
│   │   ├── weights/best.pt            # Trained YOLO model
│   │   └── shared/                    # Copied from root (class_map, model_meta)
│   ├── deploy.ps1                     # PowerShell deployment script
│   └── build_local.ps1                # Local Docker build
│
├── backend/                           # Local dev Flask server
│   ├── main.py
│   ├── serviceAccountKey.json         # Firebase credentials
│   └── requirements.txt
│
├── ml/
│   ├── prediction_service.py          # Core inference logic
│   ├── weights/best.pt                # Master model weights
│   └── make_yolo_det_from_class.py    # Label format converter
│
├── shared/
│   ├── class_map.json                 # Waste category mappings (name ↔ index)
│   └── model_meta.json                # Model version metadata
│
├── retraining/
│   ├── kaggle_retrain_notebook.ipynb  # GPU training (Kaggle P100); also stored in GCS at notebook/
│   ├── retrain_model.py               # Local fine-tuning script
│   ├── download_feedback_data.py      # Fetch from GCS via Firebase Admin
│   ├── check_feedback_count.py        # Validate threshold (1000+)
│   ├── dataset.yaml                   # YOLO dataset config
│   ├── README.md                      # Detailed retraining guide
│   ├── Bucket Credentials.json        # GCS service account key (NOT in git)
│   ├── KaggleAPI.txt                  # Kaggle API token (NOT in git)
│   └── cloud_orchestrator/            # Automated retrain pipeline (Cloud Function)
│       ├── main.py                    # Cloud Function entry point (retrain_orchestrator)
│       ├── deploy.sh                  # Deploy Cloud Function + Cloud Scheduler
│       └── requirements.txt           # Function dependencies
│
└── utilities/
    ├── upload_recycling_centers.py    # Sync to Firestore
    ├── upload_rewards.py              # Sync to Firestore
    ├── recycling_centers.json         # Master data (814KB)
    └── rewardsData.json               # Master rewards catalog
```

## Critical Implementation Notes

### Frontend
- **File Operations**: ALWAYS use Edit tool for existing files, NOT Write (prevents overwriting)
- **Toast Notifications**: Use `react-native-toast-message` (configured globally in App.tsx)
- **Keyboard Layout**: Screens use `KeyboardAvoidingView` + `KeyboardAwareScrollView` for proper UX
- **Location Verification**: `locationVerificationService.ts` validates GPS within **25m** of center; maps ML labels → center waste types; runs in parallel per unique class via `Promise.all`
- **Real-time Updates**: User profile auto-updates via Firestore `onSnapshot` listener in AuthContext
- **Navigation Types**: All route params defined in `RootStackParamList` (types.ts)
- **Firestore path**: Scan history lives at `scans/{uid}/results` (NOT `users/{uid}/scans`)
- **Per-class history**: `handleFeedbackSubmit` filters ghosts, extracts unique effective labels, saves one Firestore doc per class; ghost boxes are excluded, `wrong_label` uses `correctedLabel`
- **Points mapping** (`getCategoryPoints`): glass=25, metal=20, plastic=15, paper/cardboard=10, trash=5
- **SVG drawing**: `react-native-svg` + `PanResponder` for interactive box drawing on image; boxes stored as pixel coords then converted to normalized YOLO coords on submit
- **RecyclingCenters focusCenter**: pass `{ focusCenter: { id, name, latitude, longitude } }` as nav param to open the map centered on a specific center

### Backend/Cloud Service
- **Image Upload**: Images saved to GCS immediately on `/predict` (UUID filename)
- **Feedback Processing**: Converts user feedback → YOLO labels → moves to `training_data/`
- **Points System**: Only awards points if `location_verified: true` in feedback payload; frontend submits twice — once unverified, once verified if GPS check passes
- **Community Review**: `/pending-images` returns unreviewed GCS images; `/community-feedback` saves annotations; `DELETE /pending-images/<id>` removes from queue
- **Class Map Loading**: `cloud_service/build_context/shared/class_map.json` (copied during Docker build)
- **Error Handling**: Always return JSON errors with proper HTTP status codes

### Model Training
- **Threshold**: Require 1000+ labeled images before retraining (check with `check_feedback_count.py`)
- **Fine-tuning Strategy**: NEVER train from scratch - use `--base-weights` to preserve learned features
- **Kaggle Setup**: Upload `serviceAccountKey.json` as secret named `FIREBASE_CREDENTIALS`
- **Deployment**: After training, copy new `best.pt` → `cloud_service/build_context/weights/` and redeploy
- **Automated pipeline**: `cloud_orchestrator/main.py` is a Cloud Function that manages the full retrain cycle end-to-end; `deploy.sh` sets up the function + Cloud Scheduler (every 3 days)
- **Notebook in GCS**: The Kaggle notebook must be uploaded to GCS at `notebook/kaggle_retrain_notebook.ipynb` — the orchestrator reads it from there and pushes it to Kaggle via API
- **Training result signal**: Kaggle notebook writes `models/training_status.json` to GCS after training; orchestrator reads this to decide whether to trigger Cloud Build
- **Testing mode**: `cloud_orchestrator/main.py` has reduced constants (`MIN_SAMPLES=35`, `POLL_INTERVAL_SEC=60`, `MAX_WAIT_SEC=600`) — restore to production values (`1000`, `900`, `3600`) before going live

### GCS Bucket Organization
- **pending_images/**: Temporary storage until feedback received
- **training_data/**: Active dataset for next training run
- **trained_data/{timestamp}/**: Archived batches (prevents duplicate training)

### Session Management
- **Duration**: 2 hours (7200000ms) configured in AuthContext.tsx:13
- **Timeout Check**: Runs on each app focus (AppState listener)
- **Storage**: `lastLoginTimestamp` in AsyncStorage

## Common Patterns

### Adding a New Screen
1. Create screen component in `frontend/MyApp/src/screens/`
2. Add route to `RootStackParamList` in `types.ts`
3. Register in `AppNavigator.tsx` (Authorized/Unauthorized stack)
4. Use TypeScript navigation types:
   ```typescript
   import { NativeStackScreenProps } from '@react-navigation/native-stack';
   import { RootStackParamList } from '../types';

   type Props = NativeStackScreenProps<RootStackParamList, 'ScreenName'>;
   ```

### Making API Calls
```typescript
const response = await fetch(`${CLOUD_MODEL_URL}/predict`, {
  method: 'POST',
  body: formData,
});
const data: PredictionResponse = await response.json();
```

### Updating User Points
Points updated automatically via Firestore - no manual state management needed:
```python
# Backend (main.py)
user_ref.update({
  'points': firestore.Increment(points_to_add),
  'itemsScanned': firestore.Increment(1)
})
# Frontend AuthContext listener receives update instantly
```

### Handling Firestore Real-time Updates
```typescript
// Already implemented in AuthContext - just use the context:
const { user, profile, loading } = useAuth();
// profile.points updates automatically when backend changes Firestore
```

## Model Retraining Workflow

### Manual Workflow
1. **Check threshold**: `python check_feedback_count.py --threshold 1000`
2. **Download data**: `python download_feedback_data.py`
3. **Train** (choose one):
   - Kaggle GPU (recommended): Upload notebook + weights, run with P100
   - Local: `python retrain_model.py --base-weights ../ml/weights/best.pt --epochs 50`
4. **Update version**: Edit `shared/model_meta.json` with new version string
5. **Deploy**: Copy `best.pt` to cloud_service/build_context/weights/ and run `deploy.ps1`
6. **Archive**: Backend automatically moves trained data to `trained_data/{timestamp}/`

### Automated Workflow (Cloud Orchestrator)
The `cloud_orchestrator/` runs as a **Cloud Function (Gen 2)** triggered by **Cloud Scheduler every 3 days at 02:00 UTC**. Full pipeline:

1. **Count samples** → GCS `training_data/` must have ≥ 1000 valid image+label pairs (currently 35 for testing — restore `MIN_SAMPLES` before production)
2. **Trigger Kaggle** → reads notebook from GCS `notebook/kaggle_retrain_notebook.ipynb`, pushes a new kernel version via Kaggle API (starts GPU run automatically)
3. **Poll completion** → polls every 15 min (currently 1 min for testing) up to 1 hr (currently 10 min for testing)
4. **Verify improvement** → reads `models/training_status.json` written by Kaggle notebook to GCS; checks `improved: true` and compares `new_map50` vs `baseline_map50`
5. **Trigger Cloud Build** → if improved, fires the Cloud Build trigger (`036930df-ed00-4a24-913e-03ca0c6e1e36`) which rebuilds and redeploys Cloud Run with new weights

**GCS paths used by orchestrator:**
- `notebook/kaggle_retrain_notebook.ipynb` — notebook read by orchestrator and pushed to Kaggle
- `models/training_status.json` — written by Kaggle notebook after training; contains `{improved, new_map50, baseline_map50}`
- `training_data/images/` and `training_data/labels/` — sample counting
- `trained_data/{timestamp}/` — archived after a training run

**Environment variables** (set in Cloud Function via deploy.sh):
- `KAGGLE_USERNAME` — Kaggle account
- `KAGGLE_KERNEL_SLUG` — `omriasidon/retrainning-waste-classification-model`
- `GCP_PROJECT` — `smart-waste-sorter`
- `CLOUD_BUILD_TRIGGER_ID` — `036930df-ed00-4a24-913e-03ca0c6e1e36`
- `KAGGLE_KEY` — injected from Secret Manager (`kaggle-api-key`)

**Testing constants to restore before production** (in `cloud_orchestrator/main.py`):
- `MIN_SAMPLES = 35` → `1000`
- `POLL_INTERVAL_SEC = 60` → `900`
- `MAX_WAIT_SEC = 600` → `3600`

## Testing Notes

- **No automated tests**: Manual testing via Expo dev client
- **API Testing**: Use `backend/db_test.py` for Firestore connection validation
- **Docker Testing**: Use `build_local.ps1` before deploying to Cloud Run

## Firebase Service Account

Required for:
- Backend API calls (Firestore, Storage)
- Model retraining (downloading GCS data)
- Data upload utilities

Location: `backend/serviceAccountKey.json` or `cloud_service/serviceAccountKey.json`

**Never commit to git** - already in .gitignore
