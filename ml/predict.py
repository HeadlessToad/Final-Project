# Final-Project/ml/predict.py
# Temporary, returns a fixed answer so wiring can proceed

from typing import Dict

CLASSES = ["plastic", "paper", "glass", "metal", "organic", "trash"]

def classify_bytes(_bytes: bytes) -> Dict:
    # TODO: replace with real TF model later
    return {
        "prediction": "plastic",
        "confidence": 0.90,
        "topk": [["plastic", 0.90], ["paper", 0.05], ["glass", 0.03], ["metal", 0.01], ["organic", 0.01], ["trash", 0.00]],
        "tips": "Rinse and place in plastics bin.",
        "model_version": "v0-dummy"
    }
