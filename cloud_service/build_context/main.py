import sys
import os
import datetime
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

# --- 1. SETUP PATHS ---
# Add project root to system path to allow importing 'ml'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

app = Flask(__name__)

# --- 2. SETUP FIREBASE ---


def init_firebase():
    """Initializes Firestore connection."""
    try:
        if not firebase_admin._apps:
            # Use the path found in your old server.py
            # MAKE SURE THIS PATH IS CORRECT ON YOUR MACHINE
            cred_path = os.path.join(os.path.dirname(
                __file__), 'serviceAccountKey.json')

            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print("✅ Firebase initialized successfully.")
            else:
                print(f"⚠️ Warning: Firebase key not found at {cred_path}")
                return None
        return firestore.client()
    except Exception as e:
        print(f"❌ Firebase Error: {e}")
        return None


# Initialize DB
db = init_firebase()

# --- 3. ROUTES ---


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "service": "Waste Sort API"})


@app.route('/api/classify', methods=['POST'])
def classify():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    user_id = request.form.get('user_id', None)

    try:
        # A. Read Image
        image_bytes = file.read()

        # B. Run ML Model (Lazy Import)
        from ml.dummy_model import predict_dummy
        result = predict_dummy(image_bytes)

        # C. Save to Firestore (The "Memory")
        if db:
            # If user_id is provided, save to their history
            if user_id:
                print(f"👤 Saving to user history: {user_id}")
                collection_ref_user = db.collection('users').document(
                    user_id).collection('scans')
                collection_ref_user.add({
                    'prediction': result['prediction'],
                    'confidence': result['confidence'],
                    'timestamp': firestore.SERVER_TIMESTAMP,
                })
            # We create a record of this scan
            doc_ref = db.collection('scans').add({
                'prediction': result['prediction'],
                'confidence': result['confidence'],
                'timestamp': firestore.SERVER_TIMESTAMP,
                'tips': result['tips'],
                # In the future, you can add 'user_id' here from the request
            })
            print(f"💾 Saved result to Firestore")

        return jsonify(result)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Run on your LAN IP so the phone can connect
    app.run(host='0.0.0.0', port=8000, debug=True)
