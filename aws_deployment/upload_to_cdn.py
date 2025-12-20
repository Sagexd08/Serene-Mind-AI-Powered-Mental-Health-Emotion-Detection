import boto3
import os
import sys
from botocore.exceptions import ClientError, NoCredentialsError
from pathlib import Path

BUCKET_NAME = os.environ.get('CDN_BUCKET_NAME', 'serene-mind-frontend-cdn')
CDN_CLOUDFRONT_DOMAIN = os.environ.get('CDN_CLOUDFRONT_DOMAIN', '')
REGION = os.environ.get('AWS_REGION', 'eu-north-1')

def upload_models():
    """Upload ML models to S3 CDN with CloudFront cache invalidation"""
    try:
        s3 = boto3.client('s3', region_name=REGION)
        # Test connection
        s3.head_bucket(Bucket=BUCKET_NAME)
    except NoCredentialsError:
        print("❌ Error: AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.")
        return False
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            print(f"❌ Error: Bucket '{BUCKET_NAME}' does not exist.")
        else:
            print(f"❌ Error accessing bucket: {e}")
        return False
    except Exception as e:
        print(f"❌ Error initializing S3 client: {e}")
        return False
    
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'models')
    
    if not os.path.exists(models_dir):
        print(f"❌ Models directory not found at {models_dir}.")
        print("Run 'python ml_models/save_models.py' first to generate model files.")
        return False

    print(f"📂 Found models directory: {models_dir}")
    
    model_files = list(Path(models_dir).glob('*.pth'))
    if not model_files:
        print(f"❌ No .pth files found in {models_dir}")
        return False

    print(f"📦 Found {len(model_files)} model files to upload.\n")
    
    successful_uploads = []
    failed_uploads = []
    
    for model_path in model_files:
        filename = model_path.name
        s3_key = f"models/{filename}"
        file_size = model_path.stat().st_size / (1024 * 1024)  # Size in MB
        
        print(f"⬆️  Uploading {filename} ({file_size:.2f} MB) to s3://{BUCKET_NAME}/{s3_key}...")
        try:
            # Upload with metadata for caching
            s3.upload_file(
                str(model_path), 
                BUCKET_NAME, 
                s3_key,
                ExtraArgs={
                    'Metadata': {'uploaded-by': 'serene-mind-cdn-uploader'},
                    'CacheControl': 'public, max-age=31536000'  # 1 year cache for models
                }
            )
            print(f"✅ Successfully uploaded {filename}")
            successful_uploads.append(s3_key)
            
            # Generate CloudFront URL if domain is configured
            if CDN_CLOUDFRONT_DOMAIN:
                cdn_url = f"https://{CDN_CLOUDFRONT_DOMAIN}/{s3_key}"
                print(f"   🔗 CDN URL: {cdn_url}")
        except ClientError as e:
            print(f"❌ Failed to upload {filename}: {e}")
            failed_uploads.append(filename)
        except Exception as e:
            print(f"❌ Unexpected error uploading {filename}: {e}")
            failed_uploads.append(filename)
    
    print("\n" + "="*60)
    print(f"✅ Successful uploads: {len(successful_uploads)}/{len(model_files)}")
    if successful_uploads:
        for key in successful_uploads:
            print(f"   - {key}")
    
    if failed_uploads:
        print(f"❌ Failed uploads: {len(failed_uploads)}")
        for filename in failed_uploads:
            print(f"   - {filename}")
    print("="*60)
    
    # Invalidate CloudFront cache if distribution is configured
    if os.environ.get('CDN_DISTRIBUTION_ID'):
        try:
            cloudfront = boto3.client('cloudfront', region_name=REGION)
            paths = [f"/{key}" for key in successful_uploads]
            cloudfront.create_invalidation(
                DistributionId=os.environ.get('CDN_DISTRIBUTION_ID'),
                InvalidationBatch={'Paths': {'Quantity': len(paths), 'Items': paths}, 'CallerReference': str(os.urandom(16))}
            )
            print("🔄 CloudFront cache invalidation initiated.")
        except Exception as e:
            print(f"⚠️  Warning: CloudFront invalidation failed: {e}")
    
    return len(failed_uploads) == 0

if __name__ == "__main__":
    success = upload_models()
    sys.exit(0 if success else 1)
