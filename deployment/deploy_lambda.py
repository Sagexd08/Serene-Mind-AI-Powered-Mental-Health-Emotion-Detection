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
    """Create ZIP file with Lambda code and dependencies"""
    print("📦 Creating deployment package...")
    
    zip_path = "lambda_deployment.zip"
    package_dir = "lambda_package"
    
    # 1. Install dependencies to package directory
    if os.path.exists(package_dir):
        # shutil.rmtree(package_dir) # Optional: Clean start
        pass
    else:
        os.makedirs(package_dir)
        
    print("   Installing dependencies...")
    # Use backend/requirements-lambda.txt
    req_path = os.path.join("backend", "requirements-lambda.txt")
    if os.path.exists(req_path):
        os.system(f"pip install -r {req_path} -t {package_dir} --upgrade --no-user")
    else:
        print(f"⚠️ Warning: {req_path} not found. Skipping dependency install.")
    
    # 2. Zip dependencies
    print("   Zipping dependencies...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, package_dir)
                zipf.write(file_path, arcname)
                
        # 3. Add source files from backend/
        print("   Adding source files...")
        source_dir = "backend"
        for file in ['main.py', 'database.py', 'risk_engine.py', 'api_keys.py']:
            file_path = os.path.join(source_dir, file)
            if os.path.exists(file_path):
                zipf.write(file_path, arcname=file)
                print(f"  ✓ Added {file}")
            else:
                print(f"  ⚠️ Warning: {file} not found in {source_dir}")

        # 4. Add ml_models/ directory
        print("   Adding ml_models...")
        ml_models_dir = "ml_models"
        if os.path.exists(ml_models_dir):
            for root, dirs, files in os.walk(ml_models_dir):
                for file in files:
                    if file.endswith('.py'): # Only python files, not heavy .pth models
                        file_path = os.path.join(root, file)
                        # Keep ml_models/ structure in zip
                        zipf.write(file_path, arcname=file_path)
            print("  ✓ Added ml_models code")
        else:
            print("  ⚠️ Warning: ml_models directory not found")
    
    print(f"✅ Created {zip_path}")
    return zip_path

def create_or_update_lambda(zip_path):
    """Deploy Lambda function"""
    lambda_client = boto3.client('lambda', region_name=REGION)
    iam_client = boto3.client('iam')
    
    # Get or create IAM role (Simplified for brevity, assuming existing role works or is created)
    try:
        role = iam_client.get_role(RoleName=ROLE_NAME)
        role_arn = role['Role']['Arn']
    except:
        # If role missing, we restart or fail (simplified)
        print("⚠️ Role not found, please check deployment script full creation logic")
        return

    # Read ZIP file
    with open(zip_path, 'rb') as f:
        zip_content = f.read()
    
    # Environment Variables
    env_vars = {
        'Variables': {
            'APP_AWS_REGION': REGION,
            'EMOTION_LOGS_TABLE': 'EmotionLogs',
            'RISK_SUMMARY_TABLE': 'RiskSummary',
            'API_KEYS_TABLE': 'ApiKeys',
            'MODEL_BUCKET': 'serene-mind-models',
            'FORCE_REAL_DB': 'true',
            'CLERK_ISSUER_URL': 'https://fresh-bluejay-63.clerk.accounts.dev',
            'CLERK_CLIENT_ID': 'tIaNpblOncTqP4NI'
        }
    }

    # Try to update existing function
    try:
        response = lambda_client.update_function_code(
            FunctionName=FUNCTION_NAME,
            ZipFile=zip_content
        )
        print(f"✅ Updated Lambda function code: {FUNCTION_NAME}")
        
        # Wait for update to complete
        print("⏳ Waiting for update to complete...")
        waiter = lambda_client.get_waiter('function_updated')
        waiter.wait(FunctionName=FUNCTION_NAME)
        
        # Also update configuration (Env vars)
        lambda_client.update_function_configuration(
            FunctionName=FUNCTION_NAME,
            Environment=env_vars
        )
        print(f"✅ Updated Lambda configuration")
        
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
            Environment=env_vars
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
