import { processRequestJob } from './queue.processor';
import { decrypt } from '../utils/crypto';
import axios from 'axios';

jest.mock('../utils/crypto');
jest.mock('axios');

describe('Queue Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processRequestJob', () => {
    it('should process job successfully and send to target URL', async () => {
      const mockJob = {
        id: 'job-123',
        data: {
          encryptedData: 'encrypted-data',
          userId: 'user123',
          userPass: 'pass123',
          targetUrl: 'https://example.com/api',
        },
      };

      const decryptedData = 'decrypted-data';
      (decrypt as jest.Mock).mockReturnValue(decryptedData);
      (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

      await processRequestJob(mockJob);

      expect(decrypt).toHaveBeenCalledWith('encrypted-data');
      expect(axios.post).toHaveBeenCalledWith('https://example.com/api', {
        data: decryptedData,
        userId: 'user123',
        userPass: 'pass123',
      });
    });

    it('should handle decryption failure', async () => {
      const mockJob = {
        id: 'job-456',
        data: {
          encryptedData: 'invalid-encrypted-data',
          userId: 'user123',
          userPass: 'pass123',
          targetUrl: 'https://example.com/api',
        },
      };

      (decrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      await expect(processRequestJob(mockJob)).rejects.toThrow('Decryption failed');
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle axios post failure', async () => {
      const mockJob = {
        id: 'job-789',
        data: {
          encryptedData: 'encrypted-data',
          userId: 'user123',
          userPass: 'pass123',
          targetUrl: 'https://example.com/api',
        },
      };

      const decryptedData = 'decrypted-data';
      (decrypt as jest.Mock).mockReturnValue(decryptedData);
      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(processRequestJob(mockJob)).rejects.toThrow('Network error');
      expect(decrypt).toHaveBeenCalledWith('encrypted-data');
      expect(axios.post).toHaveBeenCalled();
    });

    it('should process job with JSON data', async () => {
      const mockJob = {
        id: 'job-json',
        data: {
          encryptedData: 'encrypted-json',
          userId: 'userJson',
          userPass: 'passJson',
          targetUrl: 'https://api.example.com/process',
        },
      };

      const decryptedData = JSON.stringify({ key: 'value', number: 123 });
      (decrypt as jest.Mock).mockReturnValue(decryptedData);
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: 'success' });

      await processRequestJob(mockJob);

      expect(decrypt).toHaveBeenCalledWith('encrypted-json');
      expect(axios.post).toHaveBeenCalledWith('https://api.example.com/process', {
        data: decryptedData,
        userId: 'userJson',
        userPass: 'passJson',
      });
    });

    it('should handle empty decrypted data', async () => {
      const mockJob = {
        id: 'job-empty',
        data: {
          encryptedData: 'encrypted-empty',
          userId: 'user123',
          userPass: 'pass123',
          targetUrl: 'https://example.com/api',
        },
      };

      (decrypt as jest.Mock).mockReturnValue('');
      (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

      await processRequestJob(mockJob);

      expect(decrypt).toHaveBeenCalledWith('encrypted-empty');
      expect(axios.post).toHaveBeenCalledWith('https://example.com/api', {
        data: '',
        userId: 'user123',
        userPass: 'pass123',
      });
    });

    it('should handle target URL with query parameters', async () => {
      const mockJob = {
        id: 'job-query',
        data: {
          encryptedData: 'encrypted-data',
          userId: 'user123',
          userPass: 'pass123',
          targetUrl: 'https://example.com/api?param=value&test=true',
        },
      };

      const decryptedData = 'decrypted-data';
      (decrypt as jest.Mock).mockReturnValue(decryptedData);
      (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

      await processRequestJob(mockJob);

      expect(axios.post).toHaveBeenCalledWith(
        'https://example.com/api?param=value&test=true',
        {
          data: decryptedData,
          userId: 'user123',
          userPass: 'pass123',
        }
      );
    });

    it('should handle special characters in userId and userPass', async () => {
      const mockJob = {
        id: 'job-special',
        data: {
          encryptedData: 'encrypted-data',
          userId: 'user!@#$%',
          userPass: 'pass^&*()',
          targetUrl: 'https://example.com/api',
        },
      };

      const decryptedData = 'decrypted-data';
      (decrypt as jest.Mock).mockReturnValue(decryptedData);
      (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

      await processRequestJob(mockJob);

      expect(axios.post).toHaveBeenCalledWith('https://example.com/api', {
        data: decryptedData,
        userId: 'user!@#$%',
        userPass: 'pass^&*()',
      });
    });

    it('should handle axios timeout error', async () => {
      const mockJob = {
        id: 'job-timeout',
        data: {
          encryptedData: 'encrypted-data',
          userId: 'user123',
          userPass: 'pass123',
          targetUrl: 'https://example.com/api',
        },
      };

      (decrypt as jest.Mock).mockReturnValue('decrypted-data');
      (axios.post as jest.Mock).mockRejectedValue(new Error('Timeout exceeded'));

      await expect(processRequestJob(mockJob)).rejects.toThrow('Timeout exceeded');
    });
  });
});
