import { encrypt, decrypt } from './crypto';

describe('Crypto Utils', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text successfully', () => {
      const originalText = 'Hello, World!';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should encrypt and decrypt JSON data', () => {
      const originalData = JSON.stringify({ userId: '123', data: 'sensitive' });
      const encrypted = encrypt(originalData);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalData);
      expect(JSON.parse(decrypted)).toEqual({ userId: '123', data: 'sensitive' });
    });

    it('should produce different encrypted values for same input', () => {
      const text = 'test data';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });

    it('should handle empty strings', () => {
      const empty = '';
      const encrypted = encrypt(empty);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(empty);
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      const encrypted = encrypt(specialText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(specialText);
    });

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 مرحبا العالم';
      const encrypted = encrypt(unicodeText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(unicodeText);
    });

    it('should throw error on invalid encrypted format', () => {
      expect(() => decrypt('invalid')).toThrow();
    });

    it('should throw error on corrupted encrypted data', () => {
      const text = 'test';
      const encrypted = encrypt(text);
      const corrupted = encrypted.substring(0, encrypted.length - 5) + 'xxxxx';

      expect(() => decrypt(corrupted)).toThrow();
    });
  });
});
