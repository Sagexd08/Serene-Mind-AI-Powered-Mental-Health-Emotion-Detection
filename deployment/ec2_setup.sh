#!/bin/bash
# EC2 Backend Deployment Script for SereneMind
# Run this script on your EC2 instance after SSH connection

set -e  # Exit on error

echo "🚀 SereneMind Backend Deployment"
echo "================================="

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Python 3.9+ if not present
echo "🐍 Installing Python..."
sudo yum install python3 python3-pip git -y

# Install AWS CLI
echo "☁️ Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Configure AWS credentials (use environment variables from .env)
echo "🔑 Configuring AWS credentials..."
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region eu-north-1

# Clone repository
echo "📥 Cloning repository..."
if [ -d "serene-mind" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd serene-mind
    git pull
else
    git clone https://github.com/your-username/serene-mind.git
    cd serene-mind
fi

# Install Python dependencies
echo "📚 Installing Python dependencies..."
cd backend
pip3 install --user -r requirements.txt

# Download ML models from S3
echo "🤖 Downloading ML models from S3..."
mkdir -p models
aws s3 cp s3://serene-mind-models/models/v2/ ./models/ --recursive

# Copy environment variables
echo "⚙️ Setting up environment variables..."
cat > .env << 'EOF'
AWS_REGION=eu-north-1
EMOTION_LOGS_TABLE=EmotionLogs
RISK_SUMMARY_TABLE=RiskSummary
MODEL_BUCKET=serene-mind-models
FORCE_REAL_DB=true
EOF

# Install and configure systemd service
echo "🔧 Setting up systemd service..."
sudo tee /etc/systemd/system/serene-mind.service > /dev/null << EOF
[Unit]
Description=SereneMind Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/serene-mind/backend
Environment="PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin"
ExecStart=/home/ec2-user/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "▶️ Starting SereneMind service..."
sudo systemctl daemon-reload
sudo systemctl enable serene-mind
sudo systemctl start serene-mind

# Check status
echo "✅ Deployment complete!"
echo ""
echo "Service status:"
sudo systemctl status serene-mind --no-pager

echo ""
echo "🌐 API should be accessible at:"
echo "   http://ec2-13-60-229-227.eu-north-1.compute.amazonaws.com:8000"
echo ""
echo "📊 Useful commands:"
echo "   sudo systemctl status serene-mind   # Check status"
echo "   sudo systemctl restart serene-mind  # Restart service"
echo "   sudo journalctl -u serene-mind -f   # View logs"
