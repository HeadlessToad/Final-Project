"""
prediction_service.py — YOLOv8 inference wrapper for the waste-classifier-eu Cloud Run container.

Responsibilities:
  1. At startup: load model weights (from GCS if available, otherwise baked-in fallback)
  2. On each request: run YOLOv8 inference, return detections + annotated image

Weight loading strategy:
  - Primary  : download gs://retrain_smart_waste_model/models/best_latest.pt at container startup
               This file is updated by the Kaggle retraining notebook when a better model is found.
               Forcing a new Cloud Run revision (via retrain_deployer) triggers a fresh download.
  - Fallback : use weights/best.pt baked into the Docker image at build time.
               Guarantees the service always starts even if GCS is unreachable.

Waste categories (class IDs from shared/class_map.json):
  0=glass  1=paper  2=cardboard  3=plastic  4=metal  5=trash
"""

import os
import io
import json
import base64
from PIL import Image
from ultralytics import YOLO
from typing import Dict, Any, List

# ── 1. Path resolution ────────────────────────────────────────────────────────
# BASE_DIR resolves to /app/ inside Docker, or the local file's directory when
# running locally for development.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# shared/ contains class_map.json and model_meta.json.
# In Docker these are copied alongside main.py. Locally they live one level up.
_shared_docker = os.path.join(BASE_DIR, 'shared')
_shared_local  = os.path.join(BASE_DIR, '..', 'shared')
SHARED_DIR = _shared_docker if os.path.isdir(_shared_docker) else _shared_local

CLASS_MAP_PATH  = os.path.join(SHARED_DIR, 'class_map.json')
MODEL_META_PATH = os.path.join(SHARED_DIR, 'model_meta.json')

# ── 2. Weight loading — GCS first, baked-in fallback ─────────────────────────
_weights_baked    = os.path.join(BASE_DIR, 'weights', 'best.pt')  # always present in the image
_weights_gcs_local = '/tmp/best_latest.pt'                         # download destination

def _try_download_latest_weights() -> str:
    """
    Try to download the latest trained weights from GCS.
    Returns the local path to use for loading the model.

    Called once at module import (container startup). If GCS is unreachable or
    the file doesn't exist, falls back silently to the baked-in weights so the
    service always comes up healthy.
    """
    try:
        from google.cloud import storage as _gcs
        bucket = _gcs.Client().bucket('retrain_smart_waste_model')
        blob   = bucket.blob('models/best_latest.pt')
        if blob.exists():
            blob.download_to_filename(_weights_gcs_local)
            print(f"✅ Downloaded latest weights from GCS → {_weights_gcs_local}")
            return _weights_gcs_local
    except Exception as e:
        print(f"⚠️ Could not download weights from GCS (using baked-in): {e}")
    return _weights_baked

MODEL_WEIGHTS_PATH = _try_download_latest_weights()

# ── 3. Class map and model metadata ──────────────────────────────────────────
try:
    with open(CLASS_MAP_PATH, 'r') as f:
        CLASS_DATA = json.load(f)
        # {0: "glass", 1: "paper", 2: "cardboard", 3: "plastic", 4: "metal", 5: "trash"}
        LABELS = {int(k): v for k, v in CLASS_DATA['index_to_name'].items()}
except FileNotFoundError:
    print(f"❌ Error: Class map not found at {CLASS_MAP_PATH}")
    LABELS = {}

try:
    with open(MODEL_META_PATH, 'r') as f:
        MODEL_META     = json.load(f)
        MODEL_VERSION  = MODEL_META.get("version", "v2s-yolo-default")
        CONF_THRESHOLD = 0.25  # Detections below this confidence are discarded
except FileNotFoundError:
    print(f"❌ Error: Model meta not found at {MODEL_META_PATH}")
    MODEL_VERSION  = "v2s-yolo-default"
    CONF_THRESHOLD = 0.25

# ── 4. Recycling tips returned to the frontend ────────────────────────────────
TIPS_MAP = {
    "BIODEGRADABLE": "Place in a compost bin or designated organics waste container.",
    "CARDBOARD":     "Break down boxes flat before recycling.",
    "GLASS":         "Empty, rinse, and place in the glass bin. Labels are okay.",
    "METAL":         "Ensure cans are clean and dry. No sharp scrap metal.",
    "PAPER":         "Keep dry and flatten before placing in the paper bin.",
    "PLASTIC":       "Empty and rinse container. If it's a bottle/jug, put the cap back on.",
    "TRASH":         "This item belongs in general waste. Consider if any parts can be recycled separately."
}

# ── 5. Model loading ──────────────────────────────────────────────────────────
# Loaded once at startup into a global — reused for every prediction request.
# YOLO() loads the PyTorch model into memory; this takes a few seconds on cold start.
MODEL = None
try:
    if os.path.exists(MODEL_WEIGHTS_PATH):
        MODEL = YOLO(MODEL_WEIGHTS_PATH)
        print(f"✅ ML Model ({MODEL_VERSION}) loaded from {MODEL_WEIGHTS_PATH}")
    else:
        print(f"⚠️ Warning: Model weights not found at {MODEL_WEIGHTS_PATH}")
except Exception as e:
    print(f"❌ Error loading ML model: {e}")
    MODEL = None


# ── 6. Prediction function ────────────────────────────────────────────────────
def get_classification_result(image_bytes: bytes) -> Dict[str, Any]:
    """
    Run YOLOv8 object detection on the provided image bytes.

    Returns a dict matching the PredictionResponse schema expected by the frontend:
      prediction             — top-1 class name (e.g. "plastic")
      confidence             — top-1 confidence score (0.0–1.0)
      topk                   — list of [class_name, score] sorted by confidence
      tips                   — recycling instructions for the top-1 class
      model_version          — version string from model_meta.json
      annotated_image_base64 — JPEG with bounding boxes drawn, base64-encoded
      detections             — list of all detected objects with id, label, confidence, box_2d
    """
    if MODEL is None:
        raise RuntimeError("ML model is not loaded. Check server logs.")

    img = Image.open(io.BytesIO(image_bytes))

    # Run inference — results[0] contains all detections for the single input image
    results = MODEL.predict(img, conf=CONF_THRESHOLD, save=False,
                            project='temp_runs', name='web_predict', verbose=False)
    r = results[0]

    # Generate annotated image (bounding boxes drawn by YOLO) encoded as base64 JPEG
    # Sent back to the frontend to display before the user draws their own corrections
    try:
        annotated_img = r.plot()  # returns numpy array with boxes drawn
        pil_img = Image.fromarray(annotated_img)
        buffer  = io.BytesIO()
        pil_img.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        encoded_image_string = base64.b64encode(buffer.read()).decode('utf-8')
    except Exception as e:
        print(f"Error encoding annotated image: {e}")
        encoded_image_string = None

    # No objects detected — return an "unidentified" response
    if len(r.boxes) == 0:
        return {
            "prediction": "unidentified",
            "confidence": 0.0,
            "topk": [],
            "tips": "Could not identify the item. Please ensure the item is clearly visible.",
            "model_version": MODEL_VERSION,
            "annotated_image_base64": None,
        }

    # Build detections list and top-k map from all detected boxes
    top_k_map  = {}  # {class_name: highest_confidence} — deduplicates multiple boxes of same class
    detections = []

    for i, box in enumerate(r.boxes):
        class_id   = int(box.cls[0].item())
        confidence = float(box.conf[0].item())
        class_name = MODEL.names.get(class_id, "unknown") if MODEL else "unknown"

        # box_2d: [x_center, y_center, width, height] normalized to [0, 1]
        # Used by the frontend to draw SVG overlay boxes and stored in YOLO label format
        xywhn = box.xywhn[0].tolist()
        print("xywhn", xywhn)
        detections.append({
            "id":         f"box_{i}",
            "label":      class_name,
            "confidence": round(confidence, 3),
            "box_2d":     xywhn
        })

        # Keep the highest confidence score per class for the top-k list
        if class_name not in top_k_map or confidence > top_k_map[class_name]:
            top_k_map[class_name] = confidence

    # Sort classes by confidence descending for the top-k response
    top_k_list: List[List[Any]] = sorted(
        [[name, round(score, 3)] for name, score in top_k_map.items()],
        key=lambda x: x[1],
        reverse=True
    )

    top_prediction_name       = top_k_list[0][0]
    top_prediction_confidence = top_k_list[0][1]

    # Look up recycling tip using uppercase key (TIPS_MAP keys are uppercase)
    tips = TIPS_MAP.get(
        top_prediction_name.upper(),
        "Sorting instructions not found. Check local guidelines."
    )

    return {
        "prediction":             top_prediction_name,
        "confidence":             top_prediction_confidence,
        "topk":                   top_k_list,
        "tips":                   tips,
        "model_version":          MODEL_VERSION,
        "annotated_image_base64": encoded_image_string,
        "detections":             detections
    }
