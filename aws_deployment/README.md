# AWS Deployment Scripts

This directory contains scripts to help deploy the SereneMind ML models to AWS.

## Prerequisites

- AWS Credentials configured (via `aws configure` or environment variables).
- Python environment with `boto3`, `torch`, etc.

## Configuration Details (from User)

- **Key Pair**: `serene-mind-ec2-key.pem`
- **CDN Name**: `serene-mind-frontend-cdn`
- **Distribution Domain**: `du34n5rronbm2.cloudfront.net`
- **CloudFront ARN**: `arn:aws:cloudfront::079900528022:distribution/E1BBRA6V4OZ6C0`
- **EC2 Instance ID**: `i-07c03748789f019d4`
- **EC2 Public DNS**: `ec2-13-60-229-227.eu-north-1.compute.amazonaws.com`

## Scripts

### 1. `upload_to_cdn.py`

This script uploads the trained `.pth` models from `backend/models` to the S3 bucket backing the CloudFront distribution.

**Usage:**
```bash
python aws_deployment/upload_to_cdn.py
```

**Note:** The script assumes the S3 bucket name is `serene-mind-frontend-cdn`. If your CloudFront distribution uses a different bucket, please update `BUCKET_NAME` in the script.

### 2. `lambda_function.py`

This is a template for the AWS Lambda function that will serve the models.

**Features:**
- Loads models (`audio_model.pth`, `text_model.pth`, `vision_model.pth`) from the S3 bucket if not present locally.
- Caches models in memory for warm starts.
- Handles `audio`, `text`, and `vision` modalities.

**Deployment:**
To deploy this to AWS Lambda:
1. Create a deployment package (zip file) containing:
   - `lambda_function.py`
   - The `ml_models` directory (containing model definitions).
   - Dependencies (`torch`, `transformers`, `facenet_pytorch`, etc.). *Note: PyTorch is large, consider using a Lambda Container Image or AWS Lambda Layers.*
2. Create a Lambda function in AWS Console.
3. Upload the package.
4. Set the Handler to `lambda_function.lambda_handler`.
5. Ensure the Lambda execution role has permissions to read from the S3 bucket.

## EC2 Deployment

To deploy the backend to the EC2 instance (`i-07c03748789f019d4`):

**Automated:**
```bash
python aws_deployment/deploy_ec2.py
```

**Manual:**
1. SSH into the instance:
   ```bash
   ssh -i "serene-mind-ec2-key.pem" ec2-user@ec2-13-60-229-227.eu-north-1.compute.amazonaws.com
   ```
2. Clone the repository or copy the files.
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Run the backend server (e.g., using FastAPI/Uvicorn).
