
import os
import io
import json
import base64
import datetime
import uuid
from flask import Flask, request, jsonify
from PIL import Image
from ultralytics import YOLO
import firebase_admin
from firebase_admin import credentials, firestore, storage

# --- INIT FIREBASE ---
# Check if Firebase is already initialized to avoid errors during hot-reloads
if not firebase_admin._apps:
    # Ensure serviceAccountKey.json is in the same folder as main.py
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()


app = Flask(__name__)

# --- CONFIGURATION ---
# We assume everything is copied to the working directory in the container
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# In Docker, we will copy 'shared' to ./shared and weights to ./weights
CLASS_MAP_PATH = os.path.join(BASE_DIR, 'shared', 'class_map.json')
MODEL_META_PATH = os.path.join(BASE_DIR, 'shared', 'model_meta.json')
MODEL_WEIGHTS_PATH = os.path.join(BASE_DIR, 'weights', 'best_weights.pt')

# --- LOAD RESOURCES ---
try:
    with open(CLASS_MAP_PATH, 'r') as f:
        CLASS_DATA = json.load(f)
        LABELS = {int(k): v for k, v in CLASS_DATA['index_to_name'].items()}
except Exception as e:
    print(f"Error loading class map: {e}")
    LABELS = {}

try:
    with open(MODEL_META_PATH, 'r') as f:
        MODEL_META = json.load(f)
        MODEL_VERSION = MODEL_META.get("version", "v1-yolo-cloud")
        CONF_THRESHOLD = 0.25
except Exception as e:
    print(f"Error loading model meta: {e}")
    MODEL_VERSION = "v1-yolo-cloud"
    CONF_THRESHOLD = 0.25

TIPS_MAP = {
    "BIODEGRADABLE": "Place in a compost bin or designated organics waste container.",
    "CARDBOARD": "Break down boxes flat before recycling.",
    "GLASS": "Empty, rinse, and place in the glass bin. Labels are okay.",
    "METAL": "Ensure cans are clean and dry. No sharp scrap metal.",
    "PAPER": "Keep dry and flatten before placing in the paper bin.",
    "PLASTIC": "Empty and rinse container. If it's a bottle/jug, put the cap back on."
}

# --- LOAD MODEL ---
MODEL = None
if os.path.exists(MODEL_WEIGHTS_PATH):
    try:
        MODEL = YOLO(MODEL_WEIGHTS_PATH)
        print(f"✅ Cloud Model ({MODEL_VERSION}) loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading YOLO model: {e}")
else:
    print(f"❌ Model weights not found at {MODEL_WEIGHTS_PATH}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "Cloud Waste Classifier", "model": MODEL_VERSION})

def save_prediction_to_db(user_id, label, confidence, image_url=None):
    """
    Saves the prediction to:
    1. The user's personal sub-collection: users/{uid}/scans
    2. A global shared collection: scans/
    """
    scan_data = {
        "label": label,
        "confidence": float(confidence), # Convert numpy float to python float
        "timestamp": datetime.datetime.now(),
        "model_version": MODEL_VERSION,
        # Optional: if you upload the image to storage, save the URL here
        "image_url": image_url if image_url else "N/A" 
    }

    try:
        # Save to User's Personal History
        # Path: users -> [USER_ID] -> scans -> [AUTO_GENERATED_ID]
        user_ref = db.collection("users").document(user_id).collection("scans")
        user_ref.add(scan_data)
        
        print(f"✅ Successfully saved scan for user {user_id}")
        return True
    except Exception as e:
        print(f"❌ Error saving to Firestore: {e}")
        return False
    # Save to Global Scans Collection (for 'Recent Activity' feed)
    # Path: scans -> [AUTO_GENERATED_ID]
    db.collection("scans").add(scan_data)

@app.route('/predict', methods=['POST'])
def predict():
    if not MODEL:
        return jsonify({"error": "Model not running"}), 503

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    try:
        # Read and open image
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes))

        # Run Inference
        results = MODEL.predict(img, conf=CONF_THRESHOLD, save=False, verbose=False)
        r = results[0]

        # --- RETRAINING LOGIC ---
        user_id = request.form.get('user_id') or request.json.get('user_id')
        if not user_id:
            user_id = "unidentified"

        # Draw boxes and get image as base64
        # Plot method returns a numpy array (BGR)
        im_array = r.plot()  
        im = Image.fromarray(im_array[..., ::-1])  # RGB
        
        buffered = io.BytesIO()
        im.save(buffered, format="JPEG")
        encoded_image_string = base64.b64encode(buffered.getvalue()).decode('utf-8')

        if len(r.boxes) == 0:
            return jsonify({
                "prediction": "unidentified",
                "confidence": 0.0,
                "topk": [],
                "tips": "Could not identify the item.",
                "model_version": MODEL_VERSION,
                "annotated_image_base64": None
            })

        # Process detections
        top_k_map = {}
        for box in r.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            class_name = LABELS.get(class_id, "unknown")
            if class_name not in top_k_map or confidence > top_k_map[class_name]:
                top_k_map[class_name] = confidence

        top_k_list = sorted(
            [[name, round(score, 3)] for name, score in top_k_map.items()],
            key=lambda x: x[1],
            reverse=True
        )

        top_name = top_k_list[0][0]
        top_conf = top_k_list[0][1]
        tips = TIPS_MAP.get(top_name, "")

        # Save prediction to database
        save_prediction_to_db(user_id, top_name, top_conf)

        return jsonify({
            "prediction": top_name,
            "confidence": top_conf,
            "topk": top_k_list,
            "tips": tips,
            "model_version": MODEL_VERSION,
            "annotated_image_base64": encoded_image_string
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Cloud Run expects the app to listen on PORT environment variable
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
