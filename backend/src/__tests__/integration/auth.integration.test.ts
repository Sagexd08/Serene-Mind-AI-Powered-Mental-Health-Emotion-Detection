import request from 'supertest';
import { app } from '../../app';
import { generateToken } from '../../utils/jwt';
import { encrypt } from '../../utils/crypto';
import { requestQueue } from '../../config/queue';

jest.mock('../../config/queue');

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userId: 'user123',
          userPass: 'pass123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userPass: 'pass123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('userId and userPass are required');
    });

    it('should return 400 when userPass is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userId: 'user123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('userId and userPass are required');
    });

    it('should return 400 when both credentials are missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/process', () => {
    it('should process request successfully with valid token', async () => {
      const token = generateToken({ userId: 'user123', userPass: 'pass123' });
      const encryptedData = encrypt('test data');
      const mockJobId = 'job-123';

      (requestQueue.add as jest.Mock).mockResolvedValue({ id: mockJobId });

      const response = await request(app)
        .post('/auth/process')
        .set('Authorization', `Bearer ${token}`)
        .send({
          encryptedData,
          targetUrl: 'https://example.com/api',
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('jobId');
      expect(response.body.jobId).toBe(mockJobId);
    });

    it('should return 401 when no token is provided', async () => {
      const encryptedData = encrypt('test data');

      const response = await request(app)
        .post('/auth/process')
        .send({
          encryptedData,
          targetUrl: 'https://example.com/api',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const encryptedData = encrypt('test data');

      const response = await request(app)
        .post('/auth/process')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({
          encryptedData,
          targetUrl: 'https://example.com/api',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should return 400 when encryptedData is missing', async () => {
      const token = generateToken({ userId: 'user123', userPass: 'pass123' });

      const response = await request(app)
        .post('/auth/process')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUrl: 'https://example.com/api',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('encryptedData and targetUrl are required');
    });

    it('should return 400 when targetUrl is missing', async () => {
      const token = generateToken({ userId: 'user123', userPass: 'pass123' });
      const encryptedData = encrypt('test data');

      const response = await request(app)
        .post('/auth/process')
        .set('Authorization', `Bearer ${token}`)
        .send({
          encryptedData,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('encryptedData and targetUrl are required');
    });
  });

  describe('Full Auth Flow', () => {
    it('should complete full flow: login -> process', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          userId: 'testUser',
          userPass: 'testPass',
        });

      expect(loginResponse.status).toBe(200);
      const { token } = loginResponse.body;

      const encryptedData = encrypt('sensitive data');
      const mockJobId = 'job-456';
      (requestQueue.add as jest.Mock).mockResolvedValue({ id: mockJobId });

      const processResponse = await request(app)
        .post('/auth/process')
        .set('Authorization', `Bearer ${token}`)
        .send({
          encryptedData,
          targetUrl: 'https://api.example.com/endpoint',
        });

      expect(processResponse.status).toBe(202);
      expect(processResponse.body.jobId).toBe(mockJobId);
    });

    it('should reject process request with token from different user', async () => {
      const token1 = generateToken({ userId: 'user1', userPass: 'pass1' });
      const token2 = generateToken({ userId: 'user2', userPass: 'pass2' });

      const encryptedData = encrypt('data');
      (requestQueue.add as jest.Mock).mockResolvedValue({ id: 'job-1' });

      const response1 = await request(app)
        .post('/auth/process')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          encryptedData,
          targetUrl: 'https://example.com/api',
        });

      expect(response1.status).toBe(202);
      expect(requestQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          userPass: 'pass1',
        })
      );

      jest.clearAllMocks();
      (requestQueue.add as jest.Mock).mockResolvedValue({ id: 'job-2' });

      const response2 = await request(app)
        .post('/auth/process')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          encryptedData,
          targetUrl: 'https://example.com/api',
        });

      expect(response2.status).toBe(202);
      expect(requestQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user2',
          userPass: 'pass2',
        })
      );
    });
  });
});
