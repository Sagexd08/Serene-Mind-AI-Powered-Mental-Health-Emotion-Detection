const CryptoJS = require('crypto-js');

try {
  const key = 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890'; // 32 bytes hex = 64 chars
  const data = 'test data';

  console.log('Key:', key);
  console.log('Data:', data);

  // Test 1: Key as passphrase (default)
  const encrypted = CryptoJS.AES.encrypt(data, key);
  console.log('Encrypted (Passphrase):', encrypted.toString());

  // Test 2: Key as Hex WordArray
  const keyHex = CryptoJS.enc.Hex.parse(key);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encryptedKey = CryptoJS.AES.encrypt(data, keyHex, { iv: iv });
  console.log('Encrypted (Raw Key):', encryptedKey.toString());

  console.log('Success!');
} catch (error) {
  console.error('Error:', error);
}
