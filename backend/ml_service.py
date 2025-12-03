import os
import io
import json
from PIL import Image
from ultralytics import YOLO

# 1. SETUP PATHS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'best.pt')
CLASS_MAP_PATH = os.path.join(BASE_DIR, '../shared/class_map.json')

# 2. LOAD MODEL (Global - Runs once when server starts)
print("Loading YOLO model...")
model = YOLO(MODEL_PATH)

# 3. LOAD CLASS NAMES (From your shared JSON)
with open(CLASS_MAP_PATH, 'r') as f:
    class_data = json.load(f)
    # Convert keys to integers for easy lookup: {0: "glass", 1: "paper"...}
    LABELS = {int(k): v for k, v in class_data['index_to_name'].items()}


def predict_waste_type(image_bytes):
    """
    Input: Raw bytes from the phone camera.
    Output: Dictionary with label and confidence.
    """
    try:
        # Convert bytes to Image
        img = Image.open(io.BytesIO(image_bytes))

        # Run Inference
        results = model(img)

        # Process the first result (since we sent one image)
        result = results[0]

        # Check if any objects were detected
        if len(result.boxes) == 0:
            return {"label": "Unidentified", "confidence": 0.0, "color": "gray"}

        # Get the box with the highest confidence
        # (YOLO automatically sorts by confidence, so we take index 0)
        top_box = result.boxes[0]

        class_id = int(top_box.cls[0])
        confidence = float(top_box.conf[0])
        label_name = LABELS.get(class_id, "Unknown")

        return {
            "label": label_name.upper(),  # e.g., "PLASTIC"
            "confidence": round(confidence, 2),  # e.g., 0.85
            "class_id": class_id
        }

    except Exception as e:
        print(f"Error in ML Service: {e}")
        return None
