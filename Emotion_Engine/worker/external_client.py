import asyncio

async def send_result(uid: str, class_name: str, timestamp: str):
    """
    Sends the result to the external microservice.
    Currently a mock implementation.
    """
    print(f"--- MOCK EXTERNAL CLIENT ---")
    print(f"Sending result for UID: {uid}")
    print(f"Class: {class_name}")
    print(f"Timestamp: {timestamp}")
    print(f"----------------------------")
    
    # Simulate network delay
    await asyncio.sleep(0.5) 
    return True
