import axios from 'axios';
import { encrypt } from './src/utils/crypto.js';

const BASE_URL = 'http://localhost:3000';

async function exampleUsage() {
  try {
    console.log('=== JWT Auth with Encryption Example ===\n');

    const userId = 'testUser123';
    const userPass = 'testPassword456';

    console.log('1. Login to get JWT token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userId,
      userPass,
    });

    const { token } = loginResponse.data;
    console.log(`   Token received: ${token.substring(0, 50)}...\n`);

    console.log('2. Encrypt sensitive data...');
    const sensitiveData = JSON.stringify({
      message: 'This is sensitive data',
      timestamp: new Date().toISOString(),
      data: {
        field1: 'value1',
        field2: 'value2',
      },
    });
    const encryptedData = encrypt(sensitiveData);
    console.log(`   Encrypted: ${encryptedData.substring(0, 50)}...\n`);

    console.log('3. Send encrypted data to process endpoint...');
    const processResponse = await axios.post(
      `${BASE_URL}/auth/process`,
      {
        encryptedData,
        targetUrl: 'https://webhook.site/your-webhook-id',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`   Job queued: ${processResponse.data.jobId}`);
    console.log(`   Message: ${processResponse.data.message}\n`);

    console.log('=== Success! ===');
    console.log('The encrypted data will be:');
    console.log('1. Decrypted by the queue processor');
    console.log('2. Sent to the target URL with userId and userPass');
    console.log('3. Processed asynchronously\n');
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.data || error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

exampleUsage();
