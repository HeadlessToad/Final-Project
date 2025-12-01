# Smart Waste Sorter

A full-stack mobile application that uses Machine Learning to classify waste items (Plastic, Paper, Glass, etc.) and helps users sort them correctly. The app features secure user authentication, real-time image analysis, and a personal scan history.

## Features

* **AI-Powered Classification**: Identifies waste type from photos using a custom ML model.
* **User Authentication**: Secure Login & Registration using Firebase Auth.
* **Scan History**: Automatically saves classification results to a cloud database (Firestore).
* **Cross-Platform**: Runs on iOS and Android via Expo (React Native).
* **Scalable Backend**: Python Flask API designed for Cloud Run deployment.

## Tech Stack

* **Frontend**: React Native, Expo, TypeScript
* **Backend**: Python, Flask, Google Cloud Run
* **Machine Learning**: TensorFlow/Keras (Python)
* **Database & Auth**: Google Firebase (Firestore & Authentication)

## Project Structure

final-project/
├── backend/             # Flask Server & API Logic
│   ├── main.py          # Entry point for the server
│   ├── requirements.txt # Backend dependencies
│   └── serviceAccountKey.json # (Ignored by Git) Firebase Credentials
├── frontend/            # React Native Mobile App
│   ├── src/             # Source code (Screens, Navigation, Context)
│   ├── App.tsx          # Main App entry
│   └── package.json     # Frontend dependencies
├── ml/                  # Machine Learning Logic
│   ├── dummy_model.py   # Model inference logic
│   └── data/            # Dataset & training scripts
└── shared/              # Shared configurations (Class mappings, API spec)

## Local Setup Guide

Follow these steps to run the project on your machine.

### 1. Prerequisites
* Node.js & npm (for Frontend)
* Python 3.8+ (for Backend)
* Expo Go app installed on your physical phone.

### 2. Backend Setup (The Kitchen)
The backend must be running first to process images.

1. Navigate to the backend folder:
   cd backend

2. Create and activate a virtual environment:
   python -m venv .venv
   .venv\Scripts\activate

   (For Mac/Linux use: source .venv/bin/activate)

3. Install dependencies:
   pip install -r requirements.txt

4. Add your Firebase Key:
   Download your Service Account Key from the Firebase Console.
   Rename it to serviceAccountKey.json.
   Place it inside the backend/ folder.

5. Run the server:
   python main.py

   (You should see: Running on http://0.0.0.0:8000)

### 3. Frontend Setup (The Dining Room)

1. Open a new terminal and navigate to the frontend:
   cd frontend

2. Install dependencies:
   npm install

3. Critical Configuration: Connect App to Backend.
   Find your computer's local IP address (ipconfig on Windows or ifconfig on Mac).
   Open src/screens/WasteClassifier.tsx.
   Update the apiUrl variable:
   
   const apiUrl = "http://YOUR_IP_ADDRESS:8000/api/classify";

4. Start the app:
   npx expo start

5. Scan the QR code with your phone using Expo Go.

## Troubleshooting

"Network Error" or App freezes on "Classifying..."
This usually means the phone cannot reach the computer.
1. Ensure both devices are on the same Wi-Fi.
2. If using Public/School Wi-Fi, "Client Isolation" might be blocking connections.
   Fix: Disconnect computer from Wi-Fi -> Turn on Phone Hotspot -> Connect Computer to Hotspot -> Update IP in code.
3. Check if your computer's firewall is blocking Python.

## API Reference

The backend exposes the following endpoints:

* GET /health: Checks if server is running.
* POST /api/classify: Accepts an image file and user ID, returns prediction.
