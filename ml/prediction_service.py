import os
import io
import json
import base64
from PIL import Image
from ultralytics import YOLO
from typing import Dict, Any, List

# --- 1. CONFIGURATION LOADING ---
# Base directory is 'ml/'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths to shared configuration
CLASS_MAP_PATH = os.path.join(BASE_DIR, '..', 'shared', 'class_map.json')
MODEL_META_PATH = os.path.join(BASE_DIR, '..', 'shared', 'model_meta.json')
MODEL_WEIGHTS_PATH = os.path.join(
    BASE_DIR, 'train_kaggle_stable', 'weights', 'best_weights.pt')  # Your weights file

try:
    with open(CLASS_MAP_PATH, 'r') as f:
        CLASS_DATA = json.load(f)
        # Convert keys to integers for easy lookup: {0: "glass", 1: "paper"...}
        LABELS = {int(k): v for k, v in CLASS_DATA['index_to_name'].items()}
except FileNotFoundError:
    print(f"❌ Error: Class map not found at {CLASS_MAP_PATH}")
    LABELS = {}

try:
    with open(MODEL_META_PATH, 'r') as f:
        MODEL_META = json.load(f)
        MODEL_VERSION = MODEL_META.get("version", "v1-yolo-default")
        CONF_THRESHOLD = 0.25  # Standard confidence threshold for detection
except FileNotFoundError:
    print(f"❌ Error: Model meta not found at {MODEL_META_PATH}")
    MODEL_VERSION = "v1-yolo-default"
    CONF_THRESHOLD = 0.25

# Simple tips mapping for the API response
TIPS_MAP = {
    "BIODEGRADABLE": "Place in a compost bin or designated organics waste container.",
    "CARDBOARD": "Break down boxes flat before recycling.",
    "GLASS": "Empty, rinse, and place in the glass bin. Labels are okay.",
    "METAL": "Ensure cans are clean and dry. No sharp scrap metal.",
    "PAPER": "Keep dry and flatten before placing in the paper bin.",
    "PLASTIC": "Empty and rinse container. If it's a bottle/jug, put the cap back on."
}

# --- 2. MODEL LOADING (Global) ---
MODEL = None
try:
    if os.path.exists(MODEL_WEIGHTS_PATH):
        MODEL = YOLO(MODEL_WEIGHTS_PATH)
        print(f"✅ ML Model ({MODEL_VERSION}) loaded successfully.")
    else:
        print(f"⚠️ Warning: Model weights not found at {MODEL_WEIGHTS_PATH}")
except Exception as e:
    print(f"❌ Error loading ML model: {e}")
    MODEL = None


# --- 3. PREDICTION FUNCTION ---

def get_classification_result(image_bytes: bytes) -> Dict[str, Any]:
    """
    Runs YOLO object detection and formats the result into the required
    ClassificationResponse schema.
    """
    if MODEL is None:
        raise RuntimeError("ML model is not loaded. Check server logs.")

    # Convert bytes to Image
    img = Image.open(io.BytesIO(image_bytes))

    # Run Inference
    results = MODEL.predict(img, conf=CONF_THRESHOLD, save=True,
                            project='temp_runs', name='web_predict', verbose=False)

    # Process the result for the first image
    r = results[0]

    # The save location is typically the 'runs/detect/project/name' folder
    # We use the path property of the result object
    annotated_image_path = r.save_dir + '/' + os.path.basename(r.path)

    # --- NEW: Encode the annotated image to Base64 ---
    try:
        with open(annotated_image_path, "rb") as image_file:
            encoded_image_string = base64.b64encode(
                image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Error encoding annotated image: {e}")
        encoded_image_string = None

    if len(r.boxes) == 0:
        return {
            "prediction": "unidentified",
            "confidence": 0.0,
            "topk": [],
            "tips": "Could not identify the item. Please ensure the item is clearly visible.",
            "model_version": MODEL_VERSION,
            "annotated_image_base64": None,
        }

    # Process all Detections for Top-K
    top_k_map = {}

    for box in r.boxes:
        class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())
        class_name = LABELS.get(class_id, "unknown")

        # We assume the highest confidence for a class is its score
        if class_name not in top_k_map or confidence > top_k_map[class_name]:
            top_k_map[class_name] = confidence

    # Convert map to a list of [name, score] pairs and sort by score (descending)
    top_k_list: List[List[Any]] = sorted(
        [[name, round(score, 3)] for name, score in top_k_map.items()],
        key=lambda x: x[1],
        reverse=True
    )

    # Determine Top-1 Prediction (highest confidence score overall)
    top_prediction_name = top_k_list[0][0]
    top_prediction_confidence = top_k_list[0][1]

    # Build the Final Response
    tips = TIPS_MAP.get(
        top_prediction_name, "Sorting instructions not found. Check local guidelines.")

    return {
        "prediction": top_prediction_name,
        "confidence": top_prediction_confidence,
        "topk": top_k_list,
        "tips": tips,
        "model_version": MODEL_VERSION,
        "annotated_image_base64": encoded_image_string,
    }
