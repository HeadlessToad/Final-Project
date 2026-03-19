"""
utilities/upload_recycling_centers.py — ONE-TIME ADMIN SCRIPT (run manually, not deployed)

Reads the raw OpenStreetMap GeoJSON export (recycling_centers.json, ~814KB, downloaded
via Overpass Turbo) and bulk-uploads every recycling bin as a document in the
Firestore 'recycling_centers' collection.

When to re-run:
  - If the recycling_centers.json file is updated with newer OSM data.
  - If the Firestore collection is accidentally deleted.

Note: The React Native app does NOT read from this Firestore collection at runtime.
The frontend reads from the local recycling_centers.json bundled in the app assets
(via frontend/MyApp/src/data/recyclingData.ts). This Firestore upload exists as a
cloud backup / admin reference and is not wired into the live app flow.

Usage:
  cd utilities
  pip install firebase-admin
  python upload_recycling_centers.py
  (requires serviceAccountKey.json in the same folder)
"""

import json
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Setup Firebase
base_path = os.path.dirname(os.path.abspath(__file__))
cert_path = os.path.join(base_path, "serviceAccountKey.json")
cred = credentials.Certificate(cert_path)
firebase_admin.initialize_app(cred)
db = firestore.client()


def upload_recycling_centers(json_file_path):
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # GeoJSON stores data in the 'features' key
    features = data.get('features', [])

    batch = db.batch()
    for i, feature in enumerate(features):
        # 1. Use the 'id' field as the document ID
        doc_id = feature.get('id', f"unknown_{i}").replace("/", "_")
        doc_ref = db.collection('recycling_centers').document(doc_id)

        # 2. Extract properties and geometry
        properties = feature.get('properties', {})
        geometry = feature.get('geometry', {})
        coords = geometry.get('coordinates', [0, 0])

        # 3. Create a clean document structure
        doc_data = {
            "amenity": properties.get("amenity"),
            "recycling_type": properties.get("recycling_type"),
            # Store location as a Firestore GeoPoint for map queries
            "location": firestore.GeoPoint(coords[1], coords[0]),
            "items": {k.split(":")[-1]: v for k, v in properties.items() if k.startswith("recycling:")}
        }

        batch.set(doc_ref, doc_data)

        # Batch commit every 500 items for efficiency
        if (i + 1) % 500 == 0:
            batch.commit()
            batch = db.batch()
            print(f"Uploaded {i+1} centers...")

    batch.commit()
    print("Final batch uploaded successfully!")


if __name__ == "__main__":
    base_path = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_path, "recycling_centers.json")
    upload_recycling_centers(json_path)
