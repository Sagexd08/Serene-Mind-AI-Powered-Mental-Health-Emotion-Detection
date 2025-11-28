from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import base64
import io
from PIL import Image
import binascii

def decrypt_image(encrypted_data: bytes, key: str) -> Image.Image:
    """
    Decrypts the encrypted image data using AES-CBC.
    Expects encrypted_data to be IV (16 bytes) + Ciphertext.
    Expects key to be a hex string (32 bytes / 64 hex chars).
    """
    try:
        # Convert hex key to bytes
        try:
            key_bytes = binascii.unhexlify(key)
        except binascii.Error:
            # Fallback if key is somehow raw bytes or other format, but we expect hex from backend
            if len(key) == 32:
                key_bytes = key.encode('utf-8') # Unlikely but safe fallback
            else:
                raise ValueError("Invalid key format. Expected 32-byte hex string.")

        if len(key_bytes) != 32:
             raise ValueError(f"Invalid key length: {len(key_bytes)} bytes. Expected 32 bytes.")

        # Extract IV and Ciphertext
        iv = encrypted_data[:16]
        ciphertext = encrypted_data[16:]

        # Decrypt
        cipher = Cipher(algorithms.AES(key_bytes), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(ciphertext) + decryptor.finalize()

        # Unpad
        unpadder = padding.PKCS7(128).unpadder()
        data = unpadder.update(padded_data) + unpadder.finalize()
        
        # Convert bytes to Image
        image = Image.open(io.BytesIO(data))
        return image
    except Exception as e:
        print(f"Decryption failed: {e}")
        raise e

