import boto3
import zipfile
import os
import sys
import shutil
from botocore.exceptions import ClientError

# Configuration
FUNCTION_NAME = "serene-mind-inference"
REGION = os.environ.get("AWS_REGION", "eu-north-1")
ROLE_NAME = "serene-mind-lambda-role"
HANDLER = "lambda_function.lambda_handler"
RUNTIME = "python3.10"

def create_deployment_package():
    """Create ZIP file with Lambda code"""
    print("📦 Creating inference deployment package...")
    
    zip_path = "inference_deployment.zip"
    
    # Source paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(base_dir)
    
    lambda_file = os.path.join(base_dir, 'lambda_function.py')
    ml_models_dir = os.path.join(root_dir, 'ml_models')
    
    if not os.path.exists(lambda_file):
        print(f"❌ Error: {lambda_file} not found")
        return None
        
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 1. Add lambda_function.py
        print(f"   Adding lambda_function.py...")
        zipf.write(lambda_file, 'lambda_function.py')
        
        # 2. Add ml_models directory
        if os.path.exists(ml_models_dir):
            print(f"   Adding ml_models/...")
            for root, dirs, files in os.walk(ml_models_dir):
                for file in files:
                    if file.endswith('.py') or file.endswith('.json'): # Only code/config, not .pth models (too big)
                        file_path = os.path.join(root, file)
                        arcname = os.path.join('ml_models', os.path.relpath(file_path, ml_models_dir))
                        zipf.write(file_path, arcname)
        else:
            print(f"⚠️ Warning: ml_models directory not found at {ml_models_dir}")

    print(f"✅ Created {zip_path}")
    return zip_path

def get_role_arn(iam_client, role_name):
    try:
        role = iam_client.get_role(RoleName=role_name)
        return role['Role']['Arn']
    except ClientError as e:
        print(f"❌ Error getting role {role_name}: {e}")
        return None

def deploy_lambda(zip_path):
    lambda_client = boto3.client('lambda', region_name=REGION)
    iam_client = boto3.client('iam', region_name=REGION)
    
    with open(zip_path, 'rb') as f:
        zip_content = f.read()
    
    try:
        # Try to update function code
        print(f"🚀 Updating function code for {FUNCTION_NAME}...")
        lambda_client.update_function_code(
            FunctionName=FUNCTION_NAME,
            ZipFile=zip_content
        )
        print(f"✅ Successfully updated {FUNCTION_NAME}")
        
        # Wait for update
        waiter = lambda_client.get_waiter('function_updated')
        waiter.wait(FunctionName=FUNCTION_NAME)
        
        # Update configuration (timeout, memory)
        print(f"⚙️  Updating configuration...")
        lambda_client.update_function_configuration(
            FunctionName=FUNCTION_NAME,
            Timeout=30,
            MemorySize=1024, # ML needs more memory
            Environment={
                'Variables': {
                    'CDN_BUCKET_NAME': 'serene-mind-frontend-cdn',
                    'AWS_NODEJS_CONNECTION_REUSE_ENABLED': '1'
                }
            }
        )
        print(f"✅ Configuration updated")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print(f"⚠️ Function {FUNCTION_NAME} not found. Creating new function...")
            
            role_arn = get_role_arn(iam_client, ROLE_NAME)
            if not role_arn:
                print("❌ Cannot create function: Role not found")
                return False
                
            try:
                lambda_client.create_function(
                    FunctionName=FUNCTION_NAME,
                    Runtime=RUNTIME,
                    Role=role_arn,
                    Handler=HANDLER,
                    Code={'ZipFile': zip_content},
                    Timeout=30,
                    MemorySize=1024,
                    Environment={
                        'Variables': {
                            'CDN_BUCKET_NAME': 'serene-mind-frontend-cdn'
                        }
                    }
                )
                print(f"✅ Successfully created {FUNCTION_NAME}")
            except ClientError as create_error:
                print(f"❌ Failed to create function: {create_error}")
                return False
        else:
            print(f"❌ Error updating function: {e}")
            return False
            
    return True

if __name__ == "__main__":
    zip_file = create_deployment_package()
    if zip_file:
        deploy_lambda(zip_file)
        # Cleanup
        if os.path.exists(zip_file):
            os.remove(zip_file)
