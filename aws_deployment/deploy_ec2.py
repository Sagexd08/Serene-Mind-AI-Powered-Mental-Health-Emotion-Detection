import os
import time
import subprocess
import sys

# --- Configuration ---
EC2_INSTANCE_ID = "i-07c03748789f019d4"
EC2_HOST = "ec2-13-60-229-227.eu-north-1.compute.amazonaws.com"
EC2_USER = "ec2-user"
KEY_PATH = "serene-mind-ec2-key.pem"  # Assumes run from root
REMOTE_DIR = "/home/ec2-user/serene-mind"

def run_ssh_command(command, description):
    """Run a command on the EC2 instance via SSH"""
    print(f"⏳ {description}...")
    
    # Check if key exists
    if not os.path.exists(KEY_PATH):
        print(f"❌ Error: Key file '{KEY_PATH}' not found in current directory.")
        return False

    ssh_cmd = [
        "ssh",
        "-i", KEY_PATH,
        "-o", "StrictHostKeyChecking=no",
        f"{EC2_USER}@{EC2_HOST}",
        command
    ]
    
    try:
        result = subprocess.run(ssh_cmd, check=True, capture_output=True, text=True)
        print(f"✅ Success")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}: {e}")
        print(f"   Stderr: {e.stderr}")
        return False

def deploy_to_ec2():
    print(f"🚀 Deploying to EC2 ({EC2_INSTANCE_ID})...")
    
    # 1. Update Code
    check_dir_cmd = f"test -d {REMOTE_DIR} && echo 'EXISTS' || echo 'MISSING'"
    
    # Check if repo exists
    ssh_check = [
        "ssh", "-i", KEY_PATH, "-o", "StrictHostKeyChecking=no",
        f"{EC2_USER}@{EC2_HOST}", check_dir_cmd
    ]
    
    print(f"   Checking remote directory...")
    try:
        res = subprocess.run(ssh_check, capture_output=True, text=True)
        
        # Inferred repo URL from context or generic placeholder
        repo_url = "https://github.com/Sagexd08/Serene-Mind-AI-Powered-Mental-Health-Emotion-Detection.git"

        if "MISSING" in res.stdout:
            print("   Cloning repository...")
            install_git = run_ssh_command("sudo yum install -y git", "Installing Git")
            if not install_git: return

            clone_success = run_ssh_command(
                f"git clone {repo_url} {REMOTE_DIR}", 
                "Cloning Repo"
            )
            if not clone_success: return
        else:
             run_ssh_command(f"cd {REMOTE_DIR} && git pull origin main", "Pulling latest code")

    except Exception as e:
        print(f"❌ Error checking remote: {e}")
        # Proceed anyway? No, if we can't check, we probably can't deploy.
        return

    # 2. Update Dependencies
    success = run_ssh_command(
        f"cd {REMOTE_DIR} && pip install -r backend/requirements.txt",
        "Installing requirements"
    )
    if not success: return

    # 3. Restart Service (assuming systemd or pm2, here just killing and restarting uvicorn for demo)
    # Note: In production, use systemd. Here we assume a simple screen or nohup approach for the hackathon/demo.
    success = run_ssh_command(
        f"pkill -f uvicorn; cd {REMOTE_DIR} && nohup uvicorn backend.main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &",
        "Restarting Backend Server"
    )
    
    if success:
        print(f"\n✅ Deployment Complete!")
        print(f"🌍 Endpoint: http://{EC2_HOST}:8000")

if __name__ == "__main__":
    # Ensure we are in the project root
    if not os.path.exists("backend"):
        print("❌ Please run from the project root directory")
        sys.exit(1)
        
    deploy_to_ec2()
