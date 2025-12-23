import boto3
import sys

# Your API Gateway ID from the URL: https://ogz733hqv9.execute-api.eu-north-1.amazonaws.com/prod
API_ID = "ogz733hqv9"
REGION = "eu-north-1"

def update_cors():
    print(f"� Listing APIs in {REGION}...")
    client = boto3.client('apigatewayv2', region_name=REGION)
    
    try:
        apis = client.get_apis()
        found_id = None
        for api in apis.get('Items', []):
            print(f"   - {api['Name']} (ID: {api['ApiId']}, Endpoint: {api.get('ApiEndpoint', 'N/A')})")
            if 'ogz733hqv9' in api.get('ApiEndpoint', ''):
                found_id = api['ApiId']
        
        if found_id:
            print(f"✅ Found matching API ID: {found_id}")
            # Update it
            response = client.update_api(
                ApiId=found_id,
                CorsConfiguration={
                    'AllowCredentials': True,
                    'AllowHeaders': ['Content-Type', 'Authorization', 'x-user-id', 'X-Api-Key'],
                    'AllowMethods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    'AllowOrigins': ['*'],
                    'ExposeHeaders': ['x-user-id', 'Content-Type'],
                    'MaxAge': 300
                }
            )
            print("✅ CORS Updated!")
        else:
            print("❌ Could not find API matching 'ogz733hqv9'")
            
    except Exception as e:
        print(f"❌ Error listing HTTP APIs: {e}")

    try:
        print(f"🔍 Checking REST APIs (v1)...")
        client_v1 = boto3.client('apigateway', region_name=REGION)
        apis_v1 = client_v1.get_rest_apis()
        for api in apis_v1.get('items', []):
             print(f"   - {api['name']} (ID: {api['id']})")
             if api['id'] == 'ogz733hqv9':
                 print(f"✅ Found REST API: {api['id']}")
                 # Update V1 CORS is harder (requires OPTIONS method mocks), but confirming existence is step 1.
                 return

    except Exception as e:
        print(f"❌ Error listing REST APIs: {e}")

if __name__ == "__main__":
    update_cors()
