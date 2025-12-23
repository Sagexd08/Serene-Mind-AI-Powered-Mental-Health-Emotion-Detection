import boto3
import urllib.request
from botocore.exceptions import ClientError

EC2_INSTANCE_ID = "i-07c03748789f019d4"
REGION = "eu-north-1"

def fix_security_group():
    print(f"🔧 Fixing Security Group for {EC2_INSTANCE_ID}...")
    
    ec2 = boto3.client('ec2', region_name=REGION)
    
    try:
        # 1. Get Instance Details to find SG
        response = ec2.describe_instances(InstanceIds=[EC2_INSTANCE_ID])
        instance = response['Reservations'][0]['Instances'][0]
        sg_id = instance['SecurityGroups'][0]['GroupId']
        print(f"   Found Security Group: {sg_id}")
        
        # 2. Get User's Public IP
        my_ip = urllib.request.urlopen("http://checkip.amazonaws.com").read().decode('utf-8').strip()
        print(f"   Your Public IP: {my_ip}")
        
        # 3. Add Ingress Rule
        try:
            ec2.authorize_security_group_ingress(
                GroupId=sg_id,
                IpPermissions=[
                    {
                        'IpProtocol': 'tcp',
                        'FromPort': 22,
                        'ToPort': 22,
                        'IpRanges': [{'CidrIp': f"{my_ip}/32", 'Description': 'Dev Machine SSH'}]
                    },
                     {
                        'IpProtocol': 'tcp',
                        'FromPort': 8000,
                        'ToPort': 8000,
                        'IpRanges': [{'CidrIp': "0.0.0.0/0", 'Description': 'Backend API'}]
                    }
                ]
            )
            print("✅ Successfully authorized SSH (Port 22) and API (Port 8000)")
        except ClientError as e:
            if 'InvalidPermission.Duplicate' in str(e):
                print("⚠️  Rules already exist.")
            else:
                print(f"❌ Error adding rules: {e}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_security_group()
