import Queue from 'bull';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

export const requestQueue = new Queue('request-processing', {
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

export interface RequestJob {
  encryptedData: string;
  userId: string;
  targetUrl: string;
}
