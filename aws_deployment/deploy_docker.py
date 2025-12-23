import boto3
import os
import subprocess
import time
import base64

# Configuration
AWS_REGION = "eu-north-1"
ECR_Repo_Name = "serenemind-backend"
Lambda_Function_Name = "serenemind-backend-docker"
Account_ID = boto3.client("sts").get_caller_identity()["Account"]
Image_URI = f"{Account_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com/{ECR_Repo_Name}:latest"

def run_command(cmd, cwd=None):
    print(f"Executing: {cmd}")
    try:
        subprocess.check_call(cmd, shell=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e}")
        # Dont exit, try to proceed if possible or let user handle
        raise e

def deploy_docker():
    print(f"🚀 Starting Docker Deployment to AWS ECR & Lambda")
    print(f"Region: {AWS_REGION}, Account: {Account_ID}")

    # 0. Check Docker
    print("🐳 Checking Docker connectivity...")
    try:
        subprocess.check_call("docker info", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print("❌ Docker is NOT running. Please start Docker Desktop and try again.")
        return

    # 1. Login to ECR
    print("\n🔑 Logging into ECR...")
    try:
        ecr_client = boto3.client('ecr', region_name=AWS_REGION)
        token_res = ecr_client.get_authorization_token()
        auth_data = token_res['authorizationData'][0]
        token = base64.b64decode(auth_data['authorizationToken']).decode('utf-8').split(':')[1]
        endpoint = auth_data['proxyEndpoint'] # e.g., https://123.dkr.ecr.eu-north-1.amazonaws.com
        
        # Remove https:// for docker login
        domain = endpoint.replace("https://", "")
        
        # Secure login without piping in shell
        login_process = subprocess.Popen(
            f"docker login --username AWS --password-stdin {domain}", 
            shell=True, 
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = login_process.communicate(input=token.encode('utf-8'))
        
        if login_process.returncode != 0:
            print(f"❌ Login failed: {stderr.decode()}")
            raise Exception("Docker login failed")
        print("✅ ECR Login Succeeded")
        
    except Exception as e:
        print(f"❌ Failed to login to ECR: {e}")
        return

    # 2. Check/Create ECR Repo
    ecr = boto3.client('ecr', region_name=AWS_REGION)
    try:
        ecr.describe_repositories(repositoryNames=[ECR_Repo_Name])
        print(f"✅ ECR Repository '{ECR_Repo_Name}' exists.")
    except ecr.exceptions.RepositoryNotFoundException:
        print(f"⚠️ Creating ECR Repository '{ECR_Repo_Name}'...")
        ecr.create_repository(repositoryName=ECR_Repo_Name)

    # 3. Build Docker Image
    print("\n🐳 Building Docker Image...")
    # Change CWD to backend where Dockerfile is
    backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
    run_command(f"docker build -t {ECR_Repo_Name} .", cwd=backend_dir)

    # 4. Tag & Push
    print("\n⬆️ Pushing to ECR...")
    run_command(f"docker tag {ECR_Repo_Name}:latest {Image_URI}")
    run_command(f"docker push {Image_URI}")

    # 5. Update/Create Lambda
    print("\nλ Updating Lambda Function...")
    lambda_client = boto3.client('lambda', region_name=AWS_REGION)
    
    try:
        lambda_client.get_function(FunctionName=Lambda_Function_Name)
        print(f"🔄 Updating existing function code...")
        lambda_client.update_function_code(
            FunctionName=Lambda_Function_Name,
            ImageUri=Image_URI,
            Publish=True
        )
        # Wait for update
        print("Waiting for update to complete...")
        time.sleep(10)
        
    except lambda_client.exceptions.ResourceNotFoundException:
        print(f"✨ Creating NEW Lambda Function...")
        # Create Role if not exists - assuming existing role for simplicity or prompt user
        # Trying to find a role
        iam = boto3.client('iam')
        role_arn = None
        try:
            role = iam.get_role(RoleName="service-role/serenemind-role-gz733hqv9") # Try to reuse existing if known
            role_arn = role['Role']['Arn']
        except:
            # Fallback to listing roles
            print("⚠️ Could not find exact role, using first available Lambda role...")
            roles = iam.list_roles()
            for r in roles['Roles']:
                if 'lambda' in r['RoleName'].lower() and 'execution' in r['RoleName'].lower():
                    role_arn = r['Arn']
                    break
        
        if not role_arn:
            print("❌ No suitable IAM Role found. Please create a Lambda execution role manually.")
            return

        lambda_client.create_function(
            FunctionName=Lambda_Function_Name,
            PackageType='Image',
            Code={'ImageUri': Image_URI},
            Role=role_arn,
            Timeout=300, # 5 mins for DL models
            MemorySize=3008, # 3GB RAM for standard SOTA
            Environment={
                'Variables': {
                    'FORCE_REAL_DB': 'true',
                    'AWS_L_REGION': AWS_REGION
                }
            }
        )
    
    print("\n✅ Deployment Complete!")
    print(f"Lambda Function: {Lambda_Function_Name}")

if __name__ == "__main__":
    deploy_docker()
