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


def upload_products(json_file_path):
    with open(json_file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    batch = db.batch()
    for i, item in enumerate(products):
        # 1. Use the ID from your JSON as the document ID
        doc_id = str(item.get('id'))
        doc_ref = db.collection('Products').document(doc_id)

        # 2. Map all fields to ensure nothing is missing
        # We use .get() to avoid errors if a specific item is missing a field
        doc_data = {
            "title": item.get("title"),
            "points": item.get("points"),
            "category": item.get("category"),
            "image": item.get("image"),
            "description": item.get("description"),
            "shippingInfo": item.get("shippingInfo")
        }

        batch.set(doc_ref, doc_data)

        # 3. Batch commit for efficiency (Firestore limit is 500)
        if (i + 1) % 500 == 0:
            batch.commit()
            batch = db.batch()
            print(f"Uploaded {i+1} products...")

    batch.commit()
    print(
        f"Successfully uploaded {len(products)} products to the 'Products' collection!")


if __name__ == "__main__":
    # Ensure this path matches the location of your json file
    json_path = os.path.join(base_path, "rewardsData.json")

    if os.path.exists(json_path):
        upload_products(json_path)
    else:
        print(f"Error: Could not find {json_path}")
