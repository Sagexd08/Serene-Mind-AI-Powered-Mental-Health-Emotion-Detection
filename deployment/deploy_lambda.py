import boto3
import zipfile
import os
import json
from pathlib import Path

# Configuration
FUNCTION_NAME = "serene-mind-api"
REGION = "eu-north-1"
RUNTIME = "python3.9"
HANDLER = "main.handler"
ROLE_NAME = "serene-mind-lambda-role"

def create_deployment_package():
    """Create ZIP file with Lambda code"""
    print("📦 Creating deployment package...")
    
    zip_path = "lambda_deployment.zip"
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add main files
        for file in ['main.py', 'database.py', 'risk_engine.py']:
            if os.path.exists(file):
                zipf.write(file)
                print(f"  ✓ Added {file}")
        
        # Add dependencies (install locally first)
        # Note: For production, use Lambda layers or Docker
        
    print(f"✅ Created {zip_path}")
    return zip_path

def create_or_update_lambda(zip_path):
    """Deploy Lambda function"""
    lambda_client = boto3.client('lambda', region_name=REGION)
    iam_client = boto3.client('iam')
    
    # Get or create IAM role
    try:
        role = iam_client.get_role(RoleName=ROLE_NAME)
        role_arn = role['Role']['Arn']
        print(f"✓ Using existing role: {role_arn}")
    except:
        print("Creating IAM role...")
        # Create role with basic Lambda execution policy
        trust_policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }
        
        role = iam_client.create_role(
            RoleName=ROLE_NAME,
            AssumeRolePolicyDocument=json.dumps(trust_policy)
        )
        role_arn = role['Role']['Arn']
        
        # Attach policies
        iam_client.attach_role_policy(
            RoleName=ROLE_NAME,
            PolicyArn='arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
        )
        
        # Attach DynamoDB policy
        dynamodb_policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Action": [
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:Scan"
                ],
                "Resource": "*"
            }]
        }
        
        iam_client.put_role_policy(
            RoleName=ROLE_NAME,
            PolicyName='DynamoDBAccess',
            PolicyDocument=json.dumps(dynamodb_policy)
        )
        
        print(f"✅ Created role: {role_arn}")
        print("⏳ Waiting 10 seconds for role to propagate...")
        import time
        time.sleep(10)
    
    # Read ZIP file
    with open(zip_path, 'rb') as f:
        zip_content = f.read()
    
    # Try to update existing function
    try:
        response = lambda_client.update_function_code(
            FunctionName=FUNCTION_NAME,
            ZipFile=zip_content
        )
        print(f"✅ Updated Lambda function: {FUNCTION_NAME}")
    except lambda_client.exceptions.ResourceNotFoundException:
        # Create new function
        print(f"Creating new Lambda function: {FUNCTION_NAME}")
        response = lambda_client.create_function(
            FunctionName=FUNCTION_NAME,
            Runtime=RUNTIME,
            Role=role_arn,
            Handler=HANDLER,
            Code={'ZipFile': zip_content},
            Timeout=30,
            MemorySize=512,
            Environment={
                'Variables': {
                    'APP_AWS_REGION': REGION,
                    'EMOTION_LOGS_TABLE': 'EmotionLogs',
                    'RISK_SUMMARY_TABLE': 'RiskSummary',
                    'MODEL_BUCKET': 'serene-mind-models',
                    'FORCE_REAL_DB': 'true'
                }
            }
        )
        print(f"✅ Created Lambda function: {FUNCTION_NAME}")
    
    return response['FunctionArn']

def create_function_url(function_arn):
    """Create Lambda Function URL"""
    lambda_client = boto3.client('lambda', region_name=REGION)
    
    try:
        response = lambda_client.create_function_url_config(
            FunctionName=FUNCTION_NAME,
            AuthType='NONE',
            Cors={
                'AllowOrigins': ['*'],
                'AllowMethods': ['*'],
                'AllowHeaders': ['*'],
                'MaxAge': 86400
            }
        )
        url = response['FunctionUrl']
        print(f"✅ Function URL: {url}")
        return url
    except lambda_client.exceptions.ResourceConflictException:
        response = lambda_client.get_function_url_config(FunctionName=FUNCTION_NAME)
        url = response['FunctionUrl']
        print(f"✓ Using existing Function URL: {url}")
        return url

def main():
    print("🚀 Deploying SereneMind to AWS Lambda\n")
    
    # Create package
    zip_path = create_deployment_package()
    
    # Deploy Lambda
    function_arn = create_or_update_lambda(zip_path)
    
    # Create Function URL
    url = create_function_url(function_arn)
    
    print("\n" + "="*60)
    print("✅ DEPLOYMENT COMPLETE!")
    print("="*60)
    print(f"\n📍 API URL: {url}")
    print(f"\n💡 Update your frontend .env:")
    print(f"   NEXT_PUBLIC_API_BASE_URL={url.rstrip('/')}")
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
