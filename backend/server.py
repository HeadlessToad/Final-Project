import os
import argparse
import uuid
import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase():
    """
    Initialize Firebase Admin SDK either from explicit path (env or hardcoded),
    or from GOOGLE_APPLICATION_CREDENTIALS env var.
    """
    if not firebase_admin._apps:
        sa_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if sa_path and os.path.exists(sa_path):
            cred = credentials.Certificate(sa_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback to your hardcoded path (works now; switch to env var soon)
            cred = credentials.Certificate(
                r"C:\Users\doppe\Documents\Final-Project\backend\ai-waste-sorter-a22c1-firebase-adminsdk-fbsvc-cdffba1c58.json"
            )
            firebase_admin.initialize_app(cred)
    return firestore.client()

def AddUser(db):
    new_user_data = {
        "email": "newuser@example.com",
        "displayName": "New Python User",
        "createdAt": firestore.SERVER_TIMESTAMP,
    }
    doc_ref, write_result = db.collection("users").add(new_user_data)
    print(f"Added document with ID: {doc_ref.id}")
    return doc_ref.id

def GetUsers(db):
    users_ref = db.collection("users")
    docs = users_ref.stream()
    print("\nAll users:")
    count = 0
    for doc in docs:
        count += 1
        print(f"User ID: {doc.id}\n  {doc.to_dict()}")
    if count == 0:
        print("(no users yet)")

def self_test(db):
    """
    End-to-end push/pull check:
    - Create test doc
    - Read it back
    - Update a field
    - Query by field
    - Delete the doc
    """
    print("=== Firestore self-test starting ===")

    test_col = "diagnostics"
    test_id = f"selftest_{uuid.uuid4().hex[:8]}"

    # 1) Write
    print("1) Writing test doc...")
    doc_ref = db.collection(test_col).document(test_id)
    doc_ref.set({
        "createdAt": firestore.SERVER_TIMESTAMP,
        "status": "created",
        "note": "hello from server.py self-test",
        "counter": 1
    })
    print(f"   Wrote doc: {test_col}/{test_id}")

    # 2) Read
    print("2) Reading test doc...")
    snap = doc_ref.get()
    assert snap.exists, "Doc was not created!"
    print("   Read OK:", snap.to_dict())

    # 3) Update
    print("3) Updating a field...")
    doc_ref.update({"status": "updated", "counter": firestore.Increment(1)})
    print("   Update OK.")

    # 4) Query
    print("4) Querying by field (status == 'updated')...")
    q = db.collection(test_col).where("status", "==", "updated").limit(1)
    results = list(q.stream())
    assert any(r.id == test_id for r in results), "Query didn’t find the updated doc!"
    print("   Query OK, found the updated doc.")

    # 5) Delete
    print("5) Deleting the test doc...")
    doc_ref.delete()
    print("   Delete OK.")

    print("=== Firestore self-test PASSED ✅ ===")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true", help="Run Firestore push/pull check.")
    parser.add_argument("--list-users", action="store_true", help="List all docs under 'users'.")
    args = parser.parse_args()

    try:
        db = init_firebase()
        if args.self_test:
            self_test(db)
        if args.list_users:
            GetUsers(db)
        if not args.self_test and not args.list_users:
            # Default demo: add a user then list users
            AddUser(db)
            GetUsers(db)
    except Exception as e:
        print("🔥 Error during Firestore operation:", repr(e))
        raise

if __name__ == "__main__":
    main()
