import os
import sys
import uuid
import firebase_admin
from flask import Flask, request, jsonify
from firebase_admin import firestore, credentials, storage
from datetime import datetime

try:
    from prediction_service import get_classification_result
except ImportError:
    print(f"❌ Error importing prediction_service: {e}")
    get_classification_result = None


if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)

BUCKET_NAME = os.getenv("STORAGE_BUCKET", "retrain_smart_waste_model")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "active", "mode": "local_inference"}), 200

@app.route('/feedback', methods=['POST'])
def save_feedback():
    try:
        data = request.json
        # Payload expected: { "image_id": "...", "feedback_items": [...] }
        
        image_id = data.get('image_id')
        feedback_items = data.get('feedback', [])

        if not image_id:
            return jsonify({"error": "Missing image_id"}), 400

        if len(feedback_items) == 0:
            return jsonify({"error": "No feedback items provided"}), 400

        # --- GENERATE YOLO LABEL FILE CONTENT ---
        # Format: <class_index> <x_center> <y_center> <width> <height>
        label_lines = []
        
        # --- LOAD CLASS MAP ---
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            class_map_path = os.path.join(base_dir, 'shared', 'class_map.json')
            
            import json
            with open(class_map_path, 'r') as f:
                class_data = json.load(f)
            
            name_to_index = class_data.get('name_to_index', {})
        except Exception as e:
            print(f"⚠️ Could not load class_map.json: {e}")
            name_to_index = {}
        
        for item in feedback_items:
            status = item.get('status')
            box = item.get('box_2d') # [x, y, w, h]
            
            final_label = item.get('originalLabel')
            
            if status == 'ghost':
                continue # Skip "Bad Box" - don't train on this
            elif status == 'wrong_label':
                final_label = item.get('correctedLabel')
            
            if box and final_label in name_to_index:
                # Convert label to integer ID
                class_id = name_to_index[final_label]
                # Append line: "CLASS_ID x y w h"
                line = f"{class_id} {box[0]} {box[1]} {box[2]} {box[3]}"
                label_lines.append(line)
            else:
                print(f"⚠️ Label '{final_label}' not found in class map or no box provided.")
        
        if not label_lines:
             # Case: User marked everything as "Ghost" or invalid.
             # Action: Do NOT move image. Do NOT save text file. Just exit.
             print(f"⚠️ Feedback received for {image_id} but contained no valid objects. Dropping.")
             return jsonify({
                 "found": False,
                 "message": "All objects marked as invalid.",
                 "tips": "Try moving closer or ensuring the object is well-lit."
             }), 200
        
        label_content = "\n".join(label_lines)

        # --- UPLOAD LABEL FILE TO STORAGE ---
        # Same filename as image, but .txt extension
        bucket = storage.bucket(BUCKET_NAME)
        final_path = f"training_data/images/{image_id}.jpg"
        label_path = f"training_data/labels/{image_id}.txt"
        temp_path = f"temp_inbox/{image_id}.jpg"
        
        source_blob = bucket.blob(temp_path)
        
        if source_blob.exists():
            # 1. Copy to 'training_data'
            bucket.copy_blob(source_blob, bucket, final_path)
            # 2. Delete from 'temp_inbox'
            source_blob.delete()
            print(f"✅ Promoted {image_id} to permanent storage")
        else:
            # If the image isn't in temp (maybe it expired?), we can't save the label
            return jsonify({"error": "Image session expired or not found"}), 404

        # --- D. Save Label File ---
        label_blob = bucket.blob(label_path)
        label_blob.upload_from_string("\n".join(label_lines), content_type='text/plain')

        # --- SAVE METADATA TO FIRESTORE ---
        # We update the 'feedback' collection to link everything
        db.collection('feedback').add({
            "image_id": image_id,
            "image_path": f"training_data/images/{image_id}.jpg",
            "label_path": label_path,
            "created_at": datetime.utcnow(),
            "raw_feedback": feedback_items
        })
        
        return jsonify({"success": True, "message": "Training data saved"}), 200

    except Exception as e:
        print(f"❌ Feedback Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    if get_classification_result is None:
        return jsonify({"error": "Prediction service not available"}), 500

    file = request.files['file']
    try:
        # Read image bytes
        image_bytes = file.read()
        result = get_classification_result(image_bytes)
        
        # If 'detections' is empty, the model saw nothing.
        if not result.get('detections'):
            return jsonify({
                "found": False,
                "message": "No recyclable object found",
                "tips": "Try moving closer or ensuring the object is well-lit."
            }), 200
        
        # Upload Image to Firebase Storage
        # We give it a unique ID so we can find it later
        image_id = str(uuid.uuid4())
        blob_path = f"temp_inbox/{image_id}.jpg"
        
        bucket = storage.bucket(BUCKET_NAME)
        blob = bucket.blob(blob_path)
        blob.upload_from_string(image_bytes, content_type='image/jpeg')  
        print(f"✅ Uploaded {image_id} to storage temporary storage")
        # Attach the ID and Path to the response so Frontend has it
        
        result['found'] = True
        result['image_id'] = image_id
        result['storage_path'] = blob_path
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
