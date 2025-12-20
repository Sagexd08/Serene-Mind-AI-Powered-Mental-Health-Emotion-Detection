#!/usr/bin/env python3
"""
Deploy SereneMind Lambda as Docker Container Image
This enables ML model inference with torch/transformers
"""

import boto3
import subprocess
import os
import sys

# Configuration
AWS_REGION = "eu-north-1"
AWS_ACCOUNT_ID = "079900528022"  # Replace with your account ID
ECR_REPO_NAME = "serene-mind-lambda"
FUNCTION_NAME = "serene-mind-api"
IMAGE_TAG = "latest"

def create_ecr_repository():
    """Create ECR repository if it doesn't exist"""
    ecr = boto3.client('ecr', region_name=AWS_REGION)
    
    try:
        response = ecr.describe_repositories(repositoryNames=[ECR_REPO_NAME])
        print(f"✓ ECR repository '{ECR_REPO_NAME}' already exists")
        return response['repositories'][0]['repositoryUri']
    except ecr.exceptions.RepositoryNotFoundException:
        print(f"Creating ECR repository: {ECR_REPO_NAME}")
        response = ecr.create_repository(
            repositoryName=ECR_REPO_NAME,
            imageScanningConfiguration={'scanOnPush': True}
        )
        repo_uri = response['repository']['repositoryUri']
        print(f"✅ Created ECR repository: {repo_uri}")
        return repo_uri

def build_and_push_image(repo_uri):
    """Build Docker image and push to ECR"""
    print("\n🐳 Building Docker image...")
    
    # Build image
    build_cmd = f"docker build -t {ECR_REPO_NAME}:{IMAGE_TAG} ."
    result = subprocess.run(build_cmd, shell=True, cwd="../backend")
    if result.returncode != 0:
        print("❌ Docker build failed")
        sys.exit(1)
    
    print("✅ Docker image built successfully")
    
    # Login to ECR
    print("\n🔐 Logging into ECR...")
    login_cmd = f"aws ecr get-login-password --region {AWS_REGION} | docker login --username AWS --password-stdin {AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com"
    subprocess.run(login_cmd, shell=True, check=True)
    
    # Tag image
    print("\n🏷️  Tagging image...")
    tag_cmd = f"docker tag {ECR_REPO_NAME}:{IMAGE_TAG} {repo_uri}:{IMAGE_TAG}"
    subprocess.run(tag_cmd, shell=True, check=True)
    
    # Push image
    print("\n⬆️  Pushing image to ECR...")
    push_cmd = f"docker push {repo_uri}:{IMAGE_TAG}"
    subprocess.run(push_cmd, shell=True, check=True)
    
    print(f"✅ Image pushed: {repo_uri}:{IMAGE_TAG}")
    return f"{repo_uri}:{IMAGE_TAG}"

def update_lambda_function(image_uri):
    """Update Lambda function to use Docker image"""
    lambda_client = boto3.client('lambda', region_name=AWS_REGION)
    
    print(f"\n🔄 Updating Lambda function: {FUNCTION_NAME}")
    
    try:
        response = lambda_client.update_function_code(
            FunctionName=FUNCTION_NAME,
            ImageUri=image_uri
        )
        print(f"✅ Lambda function updated successfully")
        
        # Wait for update to complete
        print("⏳ Waiting for update to complete...")
        waiter = lambda_client.get_waiter('function_updated')
        waiter.wait(FunctionName=FUNCTION_NAME)
        
        # Update configuration for larger memory/timeout
        lambda_client.update_function_configuration(
            FunctionName=FUNCTION_NAME,
            MemorySize=3008,  # Max memory for faster ML inference
            Timeout=300,      # 5 minutes for model loading
            EphemeralStorage={'Size': 2048}  # 2GB temp storage
        )
        print("✅ Lambda configuration updated (3GB RAM, 5min timeout)")
        
    except lambda_client.exceptions.ResourceNotFoundException:
        print(f"❌ Lambda function '{FUNCTION_NAME}' not found")
        print("Please create the function first using the ZIP deployment")
        sys.exit(1)

def main():
    print("🚀 Deploying SereneMind Lambda with Docker\n")
    
    # Step 1: Create ECR repo
    repo_uri = create_ecr_repository()
    
    # Step 2: Build and push image
    image_uri = build_and_push_image(repo_uri)
    
    # Step 3: Update Lambda
    update_lambda_function(image_uri)
    
    print("\n" + "="*60)
    print("✅ DEPLOYMENT COMPLETE!")
    print("="*60)
    print(f"\nLambda Function: {FUNCTION_NAME}")
    print(f"Image: {image_uri}")
    print(f"Region: {AWS_REGION}")
    print("\n💡 Your Lambda now supports REAL ML inference!")

if __name__ == "__main__":
    main()
