import os
import sys
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Add the parent directory to sys.path to allow importing from 'ml'
# This is required because 'ml' is a sibling directory to 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from ml.prediction_service import get_classification_result
except ImportError as e:
    print(f"❌ Error importing prediction_service: {e}")
    get_classification_result = None

load_dotenv()

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "active", "mode": "local_inference"}), 200

@app.route('/predict', methods=['POST'])
def predict_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    if get_classification_result is None:
        return jsonify({"error": "Prediction service not available"}), 500

    file = request.files['file']
    try:
        # Read file bytes
        image_bytes = file.read()
        
        # Run local inference
        # prediction_service.get_classification_result handles:
        # 1. Loading the YOLO model
        # 2. Running inference
        # 3. Drawing bounding boxes
        # 4. Encoding the annotated image to Base64
        result = get_classification_result(image_bytes)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use port 8000 to match frontend configuration
    app.run(host='0.0.0.0', port=8000, debug=True)
