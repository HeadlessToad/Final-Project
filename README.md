# Smart Waste Sorter - Backend Server ♻️

This repository contains the **server-side application** for the Smart Waste Sorter project. It is a containerized Flask API that utilizes a custom YOLOv8 Machine Learning model to classify waste images (Plastic, Paper, Metal, etc.) and logs usage history to Google Firebase.

**Current Deployment Status:** 🟢 **Live on Google Cloud Run**

---

## 🚀 Quick Start for Frontend Developers
**You do NOT need to run this code locally to work on the App.**

If you are working on the React Native/Expo frontend, simply configure your API URL to point to the live Cloud Run instance.

* **Base URL:** `https://waste-classifier-[YOUR-PROJECT-ID].a.run.app`
* **Health Check:** `[Base URL]/model-info`
* **Prediction Endpoint:** `[Base URL]/predict`

---

## 🛠 Tech Stack
* **Framework:** Python 3.11 + Flask
* **Machine Learning:** Ultralytics YOLOv8 / TensorFlow
* **Database:** Google Firebase Firestore (via `firebase-admin`)
* **Containerization:** Docker
* **Infrastructure:** Google Cloud Run (Serverless)

---

## 📂 Project Structure
```text
backend/
├── main.py                 # Entry point: Flask app & API routes
├── Dockerfile              # Blueprint for building the container
├── requirements.txt        # Python dependencies
├── serviceAccountKey.json  # Firebase Secrets (DO NOT COMMIT THIS)
├── ml/
│   └── best.pt             # Trained YOLO model weights
└── shared/                 # Configs and class mappings
```
## Local Development Setup
Follow these steps only if you need to modify the backend code or test the model locally.

1. Prerequisites
Python 3.9+

Docker Desktop (optional, for container testing)

Credentials: You must have the serviceAccountKey.json file from the Firebase Console.

Model: Ensure ml/best.pt is present (downloaded from Kaggle/Training).

2. Install Dependencies
It is recommended to use a virtual environment.
```Bash
# Create virtual env
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install libraries
pip install -r requirements.txt
```
3. Configuration
CRITICAL: Place your serviceAccountKey.json in the root backend/ folder.

Security Warning: Ensure this file is listed in .gitignore to prevent leaking secrets to GitHub.

## Running the Server
Option A: Direct Python (Fastest for Dev)
Run the Flask app directly on your machine.

```Bash

python main.py
The server will start at http://localhost:8080.
```
Note: Your phone (Frontend) cannot reach localhost. You must use your computer's LAN IP (e.g., 192.168.1.X:8080) if testing with a physical device.

Option B: Docker Container (Production Simulation)
Build and run the container to ensure it behaves exactly like Cloud Run.

```Bash

# 1. Build the image
docker build -t waste-backend .

# 2. Run the container
docker run -p 8080:8080 waste-backend
```
## API Endpoints
1. Predict Waste Type
Classifies an uploaded image and saves the result to Firestore.

  URL: /predict
  Method: POST
  Body (Multipart/Form-Data):
    file: The image file (jpg/png).
    user_id: The UID of the logged-in user (from Firebase Auth).

Response:

```JSON

{
  "label": "Plastic",
  "confidence": 0.94,
  "message": "Scan saved successfully"
}
```
2. Model Info
Returns metadata about the active model. Useful for verifying deployments.

  URL: /model-info
  Method: GET

# Deployment Guide (Google Cloud Run)
When you are ready to push changes (code or new model) to the cloud:

Build & Submit to Container Registry:

```Bash

gcloud builds submit --tag gcr.io/[PROJECT_ID]/waste-classifier
Deploy to Cloud Run:
```
```Bash

gcloud run deploy waste-classifier \
  --image gcr.io/[PROJECT_ID]/waste-classifier \
  --platform managed
```
# Database Schema
The application writes to two Firestore collections automatically:

User History: users/{uid}/history
  Private history for the specific user.

Global Scans: scans/
  Shared collection for analytics or "Recent Global Activity" features.
