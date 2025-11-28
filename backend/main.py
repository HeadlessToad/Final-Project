from ml.dummy_model import predict_dummy
import sys
import os
from flask import Flask, request, jsonify

# Add project root to system path so we can import 'ml'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "service": "Waste Sort API"})


@app.route('/api/classify', methods=['POST'])
def classify():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    try:
        image_bytes = file.read()
        # Call the dummy model function
        result = predict_dummy(image_bytes)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Running on port 8000 matches your openapi.yaml spec
    app.run(host='127.0.0.1', port=8000, debug=True)
