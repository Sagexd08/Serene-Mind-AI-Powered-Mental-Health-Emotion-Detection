import CryptoJS from 'crypto-js';

/**
 * Encryption service for face images
 */
class EncryptionService {
  /**
   * Encrypt image data using AES encryption
   * @param imageBase64 - Base64 encoded image string
   * @param encryptionKey - Encryption key from the server
   * @returns Encrypted image data as base64 string
   */
  encryptImage(imageBase64: string, encryptionKey: string): string {
    try {
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      // Encrypt the image data using AES
      const encrypted = CryptoJS.AES.encrypt(cleanBase64, encryptionKey);

      // Return encrypted data as base64 string
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt image data');
    }
  }

  /**
   * Decrypt image data using AES decryption
   * @param encryptedData - Encrypted data string
   * @param encryptionKey - Encryption key from the server
   * @returns Decrypted image data as base64 string
   */
  decryptImage(encryptedData: string, encryptionKey: string): string {
    try {
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);

      // Convert to string
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      return decryptedString;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt image data');
    }
  }

  /**
   * Generate a hash of the image for verification
   * @param imageBase64 - Base64 encoded image string
   * @returns SHA256 hash of the image
   */
  generateImageHash(imageBase64: string): string {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      return CryptoJS.SHA256(cleanBase64).toString();
    } catch (error) {
      console.error('Hash generation error:', error);
      throw new Error('Failed to generate image hash');
    }
  }

  /**
   * Complete encryption workflow with metadata
   * @param imageBase64 - Base64 encoded image string
   * @param encryptionKey - Encryption key from server
   * @returns Object with encrypted data and metadata
   */
  encryptFaceDataWithMetadata(
    imageBase64: string,
    encryptionKey: string,
    metadata?: { timestamp?: string; userId?: string }
  ): string {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageHash = this.generateImageHash(cleanBase64);

      // Create payload with metadata
      const payload = {
        image: cleanBase64,
        hash: imageHash,
        metadata: {
          timestamp: metadata?.timestamp || new Date().toISOString(),
          userId: metadata?.userId || 'anonymous',
        },
      };

      // Encrypt the entire payload
      const payloadString = JSON.stringify(payload);
      const encrypted = CryptoJS.AES.encrypt(payloadString, encryptionKey);

      return encrypted.toString();
    } catch (error) {
      console.error('Payload encryption error:', error);
      throw new Error('Failed to encrypt face data with metadata');
    }
  }
}

export default new EncryptionService();
