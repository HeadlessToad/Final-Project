import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# 1. Load the URL from the .env file
load_dotenv()
CLOUD_MODEL_URL = os.getenv("CLOUD_MODEL_URL")

app = Flask(__name__)

# GLOBAL VARIABLE: Define version manually or read from file
MODEL_VERSION = "YOLO-Waste-v1.0 (Plastic/Paper/Metal)"
MODEL_PATH = "ml/best.pt" 

@app.route('/model-info', methods=['GET'])
def get_model_info():
    """Returns the currently active model version."""
    
    # Check if file actually exists in the container
    file_exists = os.path.exists(MODEL_PATH)
    
    # Optional: Get file size to confirm it's the full model
    file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024) if file_exists else 0
    
    return jsonify({
        "status": "active",
        "model_version": MODEL_VERSION,
        "model_file_found": file_exists,
        "model_size_mb": round(file_size, 2),
        "engine": "YOLO"
    }), 200

def classify_with_cloud(image_file):
    """Sends image to Google Cloud Run for prediction."""
    try:
        # Prepare the file to send
        # We need to reset the file pointer to the beginning before sending
        image_file.seek(0)
        files = {'file': ('image.jpg', image_file, 'image/jpeg')}
        
        print(f"☁️ Sending request to: {CLOUD_MODEL_URL}/predict...")
        response = requests.post(CLOUD_MODEL_URL + "/predict", files=files, timeout=30)
        
        # Check if the cloud said "OK"
        response.raise_for_status()
        
        # Return the JSON answer from the cloud
        return response.json()
    except Exception as e:
        print(f"❌ Cloud Error: {e}")
        return None

@app.route('/predict', methods=['POST'])
def predict_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    
    # 🔀 LOGIC SWITCH: Use Cloud if URL is set, otherwise fail (or use local)
    if CLOUD_MODEL_URL:
        result = classify_with_cloud(file)
        if result:
            return jsonify(result)
        else:
            return jsonify({"error": "Cloud classification failed"}), 500
    else:
        return jsonify({"error": "No Cloud URL configured"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)