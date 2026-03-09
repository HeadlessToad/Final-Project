import os
import sys
import uuid
import firebase_admin
from flask import Flask, request, jsonify
from firebase_admin import firestore, credentials, storage
from datetime import datetime

try:
    from prediction_service import get_classification_result
except ImportError as e:
    print(f"❌ Error importing prediction_service: {e}")
    get_classification_result = None

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)

BUCKET_NAME = os.getenv("STORAGE_BUCKET", "retrain_smart_waste_model")

@app.route('/feedback', methods=['POST'])
def save_feedback():
    try:
        data = request.json
        # Payload expected: { "image_id": "...", "feedback_items": [...] }
        
        image_id = data.get('image_id')
        feedback_items = data.get('feedback', [])
        user_id = data.get('user_id')
        location_verified = data.get('location_verified', False)

        if not image_id:
            return jsonify({"error": "Missing image_id"}), 400
        print(f"🔍 RECEIVED FEEDBACK: {feedback_items}")
        print(f"📍 Location Verified: {location_verified}")

        # --- GENERATE YOLO LABEL FILE CONTENT ---
        # Format: <class_index> <x_center> <y_center> <width> <height>
        label_lines = []
        
        # --- LOAD CLASS MAP ---
        try:
             # In Docker (Cloud Run), 'shared' is copied to the same directory as main.py
            base_dir = os.path.dirname(os.path.abspath(__file__))
            class_map_path = os.path.join(base_dir, 'shared', 'class_map.json')
            
            import json
            with open(class_map_path, 'r') as f:
                class_data = json.load(f)
            
            # Helper to get ID from label
            name_to_index = class_data.get('name_to_index', {})
        except Exception as e:
            print(f"⚠️ Could not load class_map.json: {e}")
            name_to_index = {}

        for item in feedback_items:
            # We only want to save "True" detections or "Corrected" ones
            status = item.get('status')
            box = item.get('box_2d') # [x, y, w, h]

            final_label = item.get('originalLabel')

            if status == 'ghost':
                continue # Skip "Bad Box" - don't train on this
            elif status == 'wrong_label':
                final_label = item.get('correctedLabel')

            # Normalize label to lowercase for lookup (model returns lowercase, frontend may send uppercase)
            normalized_label = final_label.lower() if final_label else None

            if box and normalized_label and normalized_label in name_to_index:
                # Convert label to integer ID (use normalized lowercase)
                class_id = name_to_index[normalized_label]
                # Append line: "CLASS_ID x y w h"
                line = f"{class_id} {box[0]} {box[1]} {box[2]} {box[3]}"
                label_lines.append(line)
            else:
                print(f"⚠️ Label '{final_label}' (normalized: '{normalized_label}') not found in class map or no box provided.")

        label_content = "\n".join(label_lines)

        # --- ONLY SAVE IF THERE'S VALID FEEDBACK ---
        if not label_lines:
            print(f"ℹ️ No valid labels to save for image {image_id}")
            return jsonify({
                "success": True,
                "message": "No valid feedback to save",
                "points_added": 0,
                "location_verified": location_verified
            }), 200

        bucket = storage.bucket(BUCKET_NAME)

        # --- MOVE IMAGE FROM PENDING TO TRAINING_DATA ---
        pending_path = f"pending_images/{image_id}.jpg"
        training_image_path = f"training_data/images/{image_id}.jpg"

        pending_blob = bucket.blob(pending_path)
        if pending_blob.exists():
            # Copy to training_data folder
            bucket.copy_blob(pending_blob, bucket, training_image_path)
            # Delete from pending folder
            pending_blob.delete()
            print(f"✅ Moved image from {pending_path} to {training_image_path}")
        else:
            print(f"⚠️ Pending image not found: {pending_path}")

        # --- UPLOAD LABEL FILE TO STORAGE ---
        label_path = f"training_data/labels/{image_id}.txt"
        label_blob = bucket.blob(label_path)
        label_blob.upload_from_string(label_content, content_type='text/plain')
        print(f"✅ Saved label file: {label_path}")

        # --- SAVE METADATA TO FIRESTORE ---
        # We update the 'feedback' collection to link everything
        db.collection('feedback').add({
            "image_id": image_id,
            "image_path": f"training_data/images/{image_id}.jpg",
            "label_path": label_path,
            "created_at": datetime.utcnow(),
            "raw_feedback": feedback_items,
            "location_verified": location_verified
        })

        # --- AWARD POINTS ONLY IF LOCATION VERIFIED ---
        points_added = 0

        if location_verified and user_id:
            # Calculate points based on feedback quality
            valid_feedback_count = sum(1 for item in feedback_items if item.get('status') in ['correct', 'wrong_label'])

            # Award 5 points per valid feedback item (minimum 5, maximum 25)
            points_added = max(5, min(valid_feedback_count * 5, 25))

            # Update user points in Firestore
            try:
                user_ref = db.collection('users').document(user_id)
                user_doc = user_ref.get()

                if user_doc.exists:
                    current_points = user_doc.to_dict().get('points', 0)
                    new_points = current_points + points_added
                    user_ref.update({
                        'points': new_points,
                        'lastUpdated': firestore.SERVER_TIMESTAMP
                    })
                    print(f"✅ Awarded {points_added} points to user {user_id}. New balance: {new_points}")
                else:
                    print(f"⚠️ User {user_id} not found in Firestore")
            except Exception as e:
                print(f"❌ Error updating user points: {e}")
        else:
            print(f"ℹ️ No points awarded - Location verified: {location_verified}, User ID present: {bool(user_id)}")

        return jsonify({
            "success": True,
            "message": "Training data saved",
            "points_added": points_added,
            "location_verified": location_verified
        }), 200

    except Exception as e:
        print(f"❌ Feedback Error: {e}")
        return jsonify({"error": str(e)}), 500

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
        # 1. Read image bytes
        image_bytes = file.read()

        # 2. Upload to PENDING folder (will be moved to training_data if feedback is submitted)
        # Images in pending_images/ are auto-deleted after a few days via bucket lifecycle rule
        image_id = str(uuid.uuid4())
        pending_path = f"pending_images/{image_id}.jpg"

        bucket = storage.bucket(BUCKET_NAME)
        blob = bucket.blob(pending_path)
        blob.upload_from_string(image_bytes, content_type='image/jpeg')

        # 3. Run Inference
        result = get_classification_result(image_bytes)

        # 4. Attach the ID to the response
        result['image_id'] = image_id

        return jsonify(result)

    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/pending-images', methods=['GET'])
def get_pending_images():
    """Get a batch of pending images for community review (max 10 at a time)"""
    try:
        bucket = storage.bucket(BUCKET_NAME)
        blobs = bucket.list_blobs(prefix="pending_images/", max_results=10)

        pending_items = []
        for blob in blobs:
            # Skip the folder itself
            if blob.name == "pending_images/":
                continue

            # Extract image_id from path (e.g., "pending_images/uuid.jpg" -> "uuid")
            image_id = blob.name.replace("pending_images/", "").replace(".jpg", "")

            # Generate a signed URL for viewing (valid for 1 hour)
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=3600,  # 1 hour
                method="GET"
            )

            pending_items.append({
                "image_id": image_id,
                "image_url": signed_url,
                "created_at": blob.time_created.isoformat() if blob.time_created else None
            })

        return jsonify({
            "success": True,
            "pending_images": pending_items,
            "count": len(pending_items)
        }), 200

    except Exception as e:
        print(f"❌ Pending Images Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/community-feedback', methods=['POST'])
def save_community_feedback():
    """Save user-drawn bounding box annotations from community review.

    Expected payload:
      {
        "image_id": "...",
        "user_id": "...",
        "boxes": [
          {"label": "plastic", "box": [x_center, y_center, w, h]},  // normalized 0-1
          ...
        ]
      }
    """
    try:
        data = request.json
        image_id = data.get('image_id')
        user_id = data.get('user_id')
        boxes = data.get('boxes', [])

        if not image_id:
            return jsonify({"error": "Missing image_id"}), 400
        if not boxes:
            return jsonify({"error": "No boxes provided — draw at least one bounding box"}), 400

        # Load class map
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            class_map_path = os.path.join(base_dir, 'shared', 'class_map.json')
            import json
            with open(class_map_path, 'r') as f:
                class_data = json.load(f)
            name_to_index = class_data.get('name_to_index', {})
        except Exception as e:
            print(f"⚠️ Could not load class_map.json: {e}")
            return jsonify({"error": "Server configuration error"}), 500

        # Build YOLO label file — one line per box
        label_lines = []
        for item in boxes:
            label = (item.get('label') or '').lower()
            box = item.get('box')  # [x_center, y_center, w, h] normalized 0-1
            if label not in name_to_index:
                print(f"⚠️ Skipping unknown label: '{label}'")
                continue
            if not box or len(box) != 4:
                print(f"⚠️ Skipping malformed box: {box}")
                continue
            class_id = name_to_index[label]
            label_lines.append(f"{class_id} {box[0]} {box[1]} {box[2]} {box[3]}")

        if not label_lines:
            return jsonify({"error": "No valid boxes after processing"}), 400

        label_content = "\n".join(label_lines)
        print(f"📝 Community YOLO labels ({len(label_lines)} boxes):\n{label_content}")

        bucket = storage.bucket(BUCKET_NAME)

        # Move image from pending to training_data
        pending_path = f"pending_images/{image_id}.jpg"
        training_image_path = f"training_data/images/{image_id}.jpg"

        pending_blob = bucket.blob(pending_path)
        if pending_blob.exists():
            bucket.copy_blob(pending_blob, bucket, training_image_path)
            pending_blob.delete()
            print(f"✅ Moved image from {pending_path} to {training_image_path}")
        else:
            return jsonify({"error": "Image not found in pending folder"}), 404

        # Save label file
        label_path = f"training_data/labels/{image_id}.txt"
        label_blob = bucket.blob(label_path)
        label_blob.upload_from_string(label_content, content_type='text/plain')
        print(f"✅ Saved community label file: {label_path}")

        # Save metadata to Firestore
        db.collection('community_feedback').add({
            "image_id": image_id,
            "image_path": training_image_path,
            "label_path": label_path,
            "boxes": boxes,
            "box_count": len(label_lines),
            "reviewer_id": user_id,
            "created_at": datetime.utcnow(),
            "source": "community_review"
        })

        return jsonify({
            "success": True,
            "message": f"Saved {len(label_lines)} annotation(s). Thank you!"
        }), 200

    except Exception as e:
        print(f"❌ Community Feedback Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/pending-images/<image_id>', methods=['DELETE'])
def delete_pending_image(image_id):
    """Remove a duplicate or unwanted image from the pending review queue."""
    try:
        bucket = storage.bucket(BUCKET_NAME)
        pending_path = f"pending_images/{image_id}.jpg"
        blob = bucket.blob(pending_path)
        if blob.exists():
            blob.delete()
            print(f"🗑️ Deleted duplicate pending image: {pending_path}")
            return jsonify({"success": True, "message": "Image removed from queue"}), 200
        else:
            return jsonify({"error": "Image not found in pending folder"}), 404
    except Exception as e:
        print(f"❌ Delete Pending Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
