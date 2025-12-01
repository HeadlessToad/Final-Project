# Final-Project
♻️ Waste Sorter App - Developer Setup Guide
This project consists of two parts:

Backend: A Python Flask server that handles the ML model and Firebase database.

Frontend: A React Native (Expo) app that runs on your phone.

Follow these steps to run the project locally.

🔧 Prerequisites
Python 3.8+ installed.

Node.js & npm installed.

Expo Go app installed on your physical phone (iOS or Android).

🚀 Step 1: Start the Backend (The Kitchen)
The backend must be running first to process images.

Navigate to the backend folder:

Bash

cd backend
Set up the Virtual Environment (Optional but recommended):

Bash

# Windows
python -m venv .venv
.venv\Scripts\activate

# Mac/Linux
python3 -m venv .venv
source .venv/bin/activate
Install Dependencies:

Bash

pip install -r requirements.txt
Add Firebase Credentials:

You need a Service Account Key from the Firebase Console.

Download the JSON file, rename it to serviceAccountKey.json, and place it inside the backend/ folder.

Run the Server:

Bash

python main.py
Success: You should see Running on all addresses (0.0.0.0) and Running on http://10.x.x.x:8000.

📱 Step 2: Configure the Frontend (The Dining Room)
The phone needs to know exactly where your computer is located on the network.

Find your Computer's Local IP:

Open a terminal and run ipconfig (Windows) or ifconfig (Mac/Linux).

Look for the IPv4 Address of your Wi-Fi adapter (e.g., 10.0.0.19 or 192.168.1.5).

Update the Code:

Open frontend/src/screens/WasteClassifier.tsx.

Find the apiUrl variable and update it with your IP:

TypeScript

// Replace with YOUR computer's actual IP
const apiUrl = "http://10.0.0.19:8000/api/classify";
Install & Run:

Bash

cd frontend
npm install
npx expo start
Connect your Phone:

Scan the QR code displayed in the terminal using the Expo Go app.

⚠️ Troubleshooting Connection Issues
If the app says "Network Error" or gets stuck on "Classifying...":

Check Wi-Fi: Ensure your phone and computer are connected to the exact same Wi-Fi network.

Public/School Wi-Fi: If you are at a university or office, the router might block device-to-device communication ("Client Isolation").

Fix: Disconnect your computer from Wi-Fi, turn on your Phone's Hotspot, and connect your computer to that Hotspot. Update the apiUrl with the new IP address.

Firewall: Ensure your computer's firewall allows Python to accept incoming connections.
