"""
ml/prediction_service.py — LOCAL / PROTOTYPE inference module (not used in production)

This is the original standalone prediction module written during local development.
It is NOT used in production — the deployed Cloud Run container uses
cloud_service/build_context/prediction_service.py instead.

Key differences vs the production version (cloud_service/build_context/prediction_service.py):
  - This version saves the annotated image to disk then reads it back (via r.save_dir).
    The production version uses r.plot() in memory (no disk I/O, faster on Cloud Run).
  - This version has no GCS weight-download logic — it only reads weights/best.pt locally.
    The production version tries gs://retrain_smart_waste_model/models/best_latest.pt first,
    so redeployed containers automatically pick up the latest retrained model.
  - TIPS_MAP here is missing "TRASH" — the production version includes it.

This file is kept as a reference for local GPU testing without spinning up Docker.
To run inference locally: import get_classification_result from this module.
"""

import os
import io
import json
import base64
from PIL import Image
from ultralytics import YOLO
from typing import Dict, Any, List

# --- 1. CONFIGURATION LOADING ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# In Docker: /app/shared/ and /app/weights/best.pt
# Locally (ml/): ../shared/ and ml/weights/best.pt
_shared_docker = os.path.join(BASE_DIR, 'shared')
_shared_local = os.path.join(BASE_DIR, '..', 'shared')
SHARED_DIR = _shared_docker if os.path.isdir(_shared_docker) else _shared_local

CLASS_MAP_PATH = os.path.join(SHARED_DIR, 'class_map.json')
MODEL_META_PATH = os.path.join(SHARED_DIR, 'model_meta.json')

_weights_docker = os.path.join(BASE_DIR, 'weights', 'best.pt')
_weights_local = os.path.join(BASE_DIR, 'weights', 'best.pt')
MODEL_WEIGHTS_PATH = _weights_docker if os.path.exists(_weights_docker) else _weights_local

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
        MODEL_VERSION = MODEL_META.get("version", "v2s-yolo-default")
        CONF_THRESHOLD = 0.25  # Standard confidence threshold for detection
except FileNotFoundError:
    print(f"❌ Error: Model meta not found at {MODEL_META_PATH}")
    MODEL_VERSION = "v2s-yolo-default"
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
    results = MODEL.predict(img, conf=CONF_THRESHOLD, save=False,
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
    detections = []

    for i, box in enumerate(r.boxes):
        class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())
        class_name = LABELS.get(class_id, "unknown")
        
        # This is required for YOLO training format
        xywhn = box.xywhn[0].tolist() # Returns [x, y, w, h] normalized 0-1
        print("xywhn", xywhn)
        detections.append({
            "id": f"box_{i}",
            "label": class_name,
            "confidence": round(confidence, 3),
            "box_2d": xywhn
        })

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
        "detections": detections
    }
