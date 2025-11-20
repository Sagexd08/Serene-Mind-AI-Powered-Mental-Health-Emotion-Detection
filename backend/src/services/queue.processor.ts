import { requestQueue, RequestJob } from '../config/queue.js';
import { decrypt } from '../utils/crypto.js';
import axios from 'axios';

export const processRequestJob = async (job: any): Promise<void> => {
  const { encryptedData, userId, userPass, targetUrl } = job.data as RequestJob;

  try {
    const decryptedData = decrypt(encryptedData);

    await axios.post(targetUrl, {
      data: decryptedData,
      userId,
      userPass,
    });

    console.log(`Job ${job.id} processed successfully`);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    throw error;
  }
};

export const initializeQueueProcessor = (): void => {
  requestQueue.process(async (job) => {
    await processRequestJob(job);
  });

  requestQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  requestQueue.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with error: ${err.message}`);
  });
};
