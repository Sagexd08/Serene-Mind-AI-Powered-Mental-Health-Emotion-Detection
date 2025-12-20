import boto3
import os
from dotenv import load_dotenv
import time

# Load env vars
load_dotenv('backend/.env')

TABLE_NAME = os.environ.get("EMOTION_LOGS_TABLE")
REGION = os.environ.get("AWS_REGION")

print(f"Testing DB Connection to {TABLE_NAME} in {REGION}...")

try:
    dynamodb = boto3.resource('dynamodb', region_name=REGION)
    table = dynamodb.Table(TABLE_NAME)
    
    # Test Write
    test_id = "VERIFICATION_SCRIPT_V2"
    timestamp = int(time.time())
    
    item = {
        'user_id': f"ANON#{test_id}", 
        'timestamp': timestamp,
        'type': 'verification',
        'message': 'Integration Verified V2'
    }
    
    print(f"Attempting to put item: {item}")
    table.put_item(Item=item)
    print("✅ Write Successful")
    
    # Test Read
    response = table.get_item(Key={
        'user_id': f"ANON#{test_id}",
        'timestamp': timestamp
    })
    
    if 'Item' in response:
        print("✅ Read Successful")
        print(f"Item: {response['Item']}")
    else:
        print("❌ Read Failed")

except Exception as e:
    print(f"❌ Connection Failed: {e}")
