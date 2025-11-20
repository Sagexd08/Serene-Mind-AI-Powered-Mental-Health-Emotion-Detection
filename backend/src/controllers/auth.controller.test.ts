import { Request, Response } from 'express';
import { login, processRequest } from './auth.controller';
import { generateToken } from '../utils/jwt';
import { requestQueue } from '../config/queue';
import { AuthRequest } from '../middlewares/auth.middleware';

jest.mock('../utils/jwt');
jest.mock('../config/queue');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockAuthRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockAuthRequest = {
      body: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      const mockToken = 'mock.jwt.token';
      mockRequest.body = {
        userId: 'user123',
        userPass: 'pass123',
      };

      (generateToken as jest.Mock).mockReturnValue(mockToken);

      await login(mockRequest as Request, mockResponse as Response);

      expect(generateToken).toHaveBeenCalledWith({
        userId: 'user123',
        userPass: 'pass123',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ token: mockToken });
    });

    it('should return 400 when userId is missing', async () => {
      mockRequest.body = {
        userPass: 'pass123',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'userId and userPass are required',
      });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return 400 when userPass is missing', async () => {
      mockRequest.body = {
        userId: 'user123',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'userId and userPass are required',
      });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return 400 when both userId and userPass are missing', async () => {
      mockRequest.body = {};

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'userId and userPass are required',
      });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return 500 when token generation fails', async () => {
      mockRequest.body = {
        userId: 'user123',
        userPass: 'pass123',
      };

      (generateToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token generation error');
      });

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Login failed',
      });
    });
  });

  describe('processRequest', () => {
    it('should queue request successfully', async () => {
      const mockJobId = 'job-123';
      mockAuthRequest.body = {
        encryptedData: 'encrypted-data',
        targetUrl: 'https://example.com/api',
      };
      mockAuthRequest.user = {
        userId: 'user123',
        userPass: 'pass123',
      };

      (requestQueue.add as jest.Mock).mockResolvedValue({ id: mockJobId });

      await processRequest(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(requestQueue.add).toHaveBeenCalledWith({
        encryptedData: 'encrypted-data',
        userId: 'user123',
        userPass: 'pass123',
        targetUrl: 'https://example.com/api',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Request queued successfully',
        jobId: mockJobId,
      });
    });

    it('should return 400 when encryptedData is missing', async () => {
      mockAuthRequest.body = {
        targetUrl: 'https://example.com/api',
      };
      mockAuthRequest.user = {
        userId: 'user123',
        userPass: 'pass123',
      };

      await processRequest(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'encryptedData and targetUrl are required',
      });
      expect(requestQueue.add).not.toHaveBeenCalled();
    });

    it('should return 400 when targetUrl is missing', async () => {
      mockAuthRequest.body = {
        encryptedData: 'encrypted-data',
      };
      mockAuthRequest.user = {
        userId: 'user123',
        userPass: 'pass123',
      };

      await processRequest(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'encryptedData and targetUrl are required',
      });
      expect(requestQueue.add).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuthRequest.body = {
        encryptedData: 'encrypted-data',
        targetUrl: 'https://example.com/api',
      };
      mockAuthRequest.user = undefined;

      await processRequest(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
      });
      expect(requestQueue.add).not.toHaveBeenCalled();
    });

    it('should return 500 when queue fails', async () => {
      mockAuthRequest.body = {
        encryptedData: 'encrypted-data',
        targetUrl: 'https://example.com/api',
      };
      mockAuthRequest.user = {
        userId: 'user123',
        userPass: 'pass123',
      };

      (requestQueue.add as jest.Mock).mockRejectedValue(new Error('Queue error'));

      await processRequest(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to queue request',
      });
    });

    it('should handle valid request with all fields', async () => {
      const mockJobId = 'job-456';
      mockAuthRequest.body = {
        encryptedData: 'very-long-encrypted-data-string',
        targetUrl: 'https://api.example.com/process',
      };
      mockAuthRequest.user = {
        userId: 'testUser',
        userPass: 'testPass',
      };

      (requestQueue.add as jest.Mock).mockResolvedValue({ id: mockJobId });

      await processRequest(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(requestQueue.add).toHaveBeenCalledWith({
        encryptedData: 'very-long-encrypted-data-string',
        userId: 'testUser',
        userPass: 'testPass',
        targetUrl: 'https://api.example.com/process',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Request queued successfully',
        jobId: mockJobId,
      });
    });
  });
});
