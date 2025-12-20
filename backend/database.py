import boto3
import os
import time
from botocore.exceptions import ClientError

# Use ENV variables for config
TABLE_NAME = os.environ.get("EMOTION_LOGS_TABLE", "SereneMind_Data_Logs")
REGION = os.environ.get("APP_AWS_REGION") or os.environ.get("AWS_REGION", "us-east-1")

class DatabaseService:
    def __init__(self, mock=True):
        self.mock = mock
        # Auto-detect if we are in an environment where we can connect to AWS (e.g. keys present or IAM role)
        # For this exercise, we keep Mock=True unless explicitly forced off or we want to try connection
        if os.environ.get("FORCE_REAL_DB"):
             self.mock = False
             
        if not self.mock:
            self.dynamodb = boto3.resource('dynamodb', region_name=REGION)
            self.table = self.dynamodb.Table(TABLE_NAME)

    def log_emotion(self, user_id, emotion_type, data):
        """
        Logs an emotion entry.
        """
        current_time = int(time.time())
        # The table uses user_id (Partition) and timestamp (Sort)
        item = {
            'user_id': f"ANON#{user_id}", # Distinct prefix for anonymous
            'timestamp': current_time, 
            'type': emotion_type,
            'date': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(current_time)),
            **data
        }
        
        if self.mock:
            print(f"[DB MOCK] Putting Item: {item}")
            return True
            
        try:
            self.table.put_item(Item=item)
            return True
        except ClientError as e:
            print(f"Error saving to DynamoDB: {e}")
            return False

    def get_recent_history(self, user_id, limit=10):
        if self.mock:
            return [{'emotion': 'neutral', 'intensity': 0.8}] * limit

        try:
            # Query using user_id and timestamp
            response = self.table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('user_id').eq(f"ANON#{user_id}"),
                ScanIndexForward=False, # Newest first
                Limit=limit
            )
            return response.get('Items', [])
        except ClientError as e:
            print(f"Error fetching history: {e}")
            return []

db = DatabaseService(mock=True)
