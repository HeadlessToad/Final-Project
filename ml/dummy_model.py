import random
import json
import os

# Define path to shared config relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SHARED_PATH = os.path.join(BASE_DIR, '..', 'shared', 'class_map.json')


def load_classes():
    try:
        with open(SHARED_PATH, 'r') as f:
            data = json.load(f)
            return list(data['index_to_name'].values())
    except FileNotFoundError:
        return ["glass", "paper", "cardboard", "plastic", "metal", "trash"]


CLASSES = load_classes()


def predict_dummy(image_bytes):
    """
    Simulates a prediction model. 
    Returns data strictly adhering to shared/api/openapi.yaml
    """
    # 1. Simulate prediction
    predicted_class = random.choice(CLASSES)
    confidence = round(random.uniform(0.75, 0.98), 2)

    # 2. Simulate Top-K (Fake probabilities)
    topk = []
    topk.append([predicted_class, confidence])

    remaining = 1.0 - confidence
    other_classes = [c for c in CLASSES if c != predicted_class]
    random.shuffle(other_classes)

    # Add noise for other classes
    for c in other_classes[:4]:
        score = round(random.uniform(0, remaining), 3)
        topk.append([c, score])
        remaining -= score

    return {
        "prediction": predicted_class,
        "confidence": confidence,
        "topk": topk,
        "tips": f"Quick tip: {predicted_class} must be clean and dry before sorting.",
        "model_version": "v0-dummy"
    }
