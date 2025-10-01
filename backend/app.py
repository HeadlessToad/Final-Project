# Final-Project/backend/app.py
from flask import Flask, request, jsonify
import os, sys

# import the ml stub using a relative path for now
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "ml"))
from predict import classify_bytes   # type: ignore

app = Flask(__name__)

@app.get("/health")
def health():
    return {"ok": True, "service": "backend"}

@app.post("/api/classify")
def classify():
    if "file" not in request.files:
        return jsonify({"error": "missing file"}), 400
    img = request.files["file"].read()
    result = classify_bytes(img)
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=8500, debug=True)  # same port you tried earlier
