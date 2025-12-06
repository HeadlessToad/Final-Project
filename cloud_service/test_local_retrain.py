import requests
import os

# Define the local URL (Cloud Service running in Docker)
url = 'http://localhost:8080/predict'

# Path to a test image
image_path = r'../backend/test_image.jpg'

def test_retrain():
    if not os.path.exists(image_path):
        print(f"❌ Test image not found at {image_path}")
        return

    print(f"🚀 Sending request to {url} with user_id='test_user_123'...")
    
    try:
        with open(image_path, 'rb') as img:
            # Send file AND user_id to trigger retraining logic
            files = {'file': img}
            data = {'user_id': 'test_user_123'}
            
            response = requests.post(url, files=files, data=data)
            
        print(f"📡 Status Code: {response.status_code}")
        print(f"📄 Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Request successful! Now checking container logs...")
        else:
            print("❌ Request failed.")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("   (Make sure the docker container is running!)")

if __name__ == "__main__":
    test_retrain()
