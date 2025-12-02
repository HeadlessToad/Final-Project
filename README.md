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

```text
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
```

## Local Setup Guide

Follow these steps to run the project on your machine.

### 1. Prerequisites
* Node.js & npm (for Frontend)
* Python 3.8+ (for Backend)
* Expo Go app installed on your physical phone.

### 2. Backend Setup
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
## Connecting via Tunnel (University/Public Wi-Fi)

   If you are developing on a restricted network (like a University or Office) where your phone cannot connect to your computer's local IP, use **ngrok** to create a secure tunnel.

   1. Install & Start ngrok
   In your backend terminal (keep Python running in another window), run:
   
   ```bash
   ngrok http 8000
   ```
   _(If ngrok is not installed, download it from ngrok.com and place the .exe in your project folder, then run .\ngrok http 8000)._
   
   2. Copy the Forwarding URL
   Look for the line in the terminal that looks like this: Forwarding https://a1b2-c3d4.ngrok-free.app -> http://localhost:8000
   
   Copy the https URL.
   
   3. Update the Frontend
   Open frontend/src/screens/WasteClassifier.tsx and update the API URL:
   
   ```TypeScript
   
   // Replace with your unique ngrok URL
   const apiUrl = "[https://your-url-here.ngrok-free.app/api/classify](https://your-url-here.ngrok-free.app/api/classify)";
   ```
   4. Reload
   Reload the app on your phone. It will now connect securely from any network (4G, Wi-Fi, etc.).
---
### 3. Frontend Setup

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
