import requests
import uuid
import time

BASE_URL = "http://localhost:8000"

def test_api_with_db():
    print(f"Testing API at {BASE_URL}...")
    
    # 1. Health Check
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"Health Check: {r.status_code} {r.json()}")
    except Exception as e:
        print("❌ Backend not running. Please start uvicorn.")
        return

    # 2. Text Emotion (Anonymous)
    anon_id = str(uuid.uuid4())
    print(f"Testing Anonymity with ID: {anon_id}")
    
    payload = {
        "text": "I am verifying the AWS integration.",
        "user_id": anon_id
    }
    headers = {
        "x-user-id": anon_id
    }
    
    r = requests.post(f"{BASE_URL}/emotion/text", json=payload, headers=headers)
    
    if r.status_code == 200:
        print("✅ Text Emotion Analysis: Success")
        print(f"Response: {r.json()}")
    else:
        print(f"❌ Text Emotion Failed: {r.status_code} {r.text}")
        
    # 3. Verify Risk Score (Reads from DB)
    # We just wrote one entry, let's see if risk engine picks it up
    r = requests.post(f"{BASE_URL}/risk/score", json={"user_id": anon_id})
    if r.status_code == 200:
        print("✅ Risk Score: Success")
        print(f"Response: {r.json()}")
    else:
        print(f"❌ Risk Score Failed: {r.status_code} {r.text}")

if __name__ == "__main__":
    test_api_with_db()
