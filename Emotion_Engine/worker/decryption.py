from cryptography.fernet import Fernet
import base64
import io
from PIL import Image

def decrypt_image(encrypted_data: bytes, key: str) -> Image.Image:
    """
    Decrypts the encrypted image data using the provided key.
    Assumes the key is a valid Fernet key (base64 encoded 32-byte key).
    """
    try:
        # Ensure key is bytes
        if isinstance(key, str):
            key_bytes = key.encode('utf-8')
        else:
            key_bytes = key
            
        f = Fernet(key_bytes)
        decrypted_data = f.decrypt(encrypted_data)
        
        # Convert bytes to Image
        image = Image.open(io.BytesIO(decrypted_data))
        return image
    except Exception as e:
        print(f"Decryption failed: {e}")
        raise e
