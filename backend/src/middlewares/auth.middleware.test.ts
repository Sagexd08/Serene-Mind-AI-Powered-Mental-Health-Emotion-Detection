import { Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from './auth.middleware';
import { generateToken } from '../utils/jwt';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should call next() with valid token', () => {
      const token = generateToken({ userId: 'user123', userPass: 'pass123' });
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('user123');
      expect(mockRequest.user?.userPass).toBe('pass123');
    });

    it('should return 401 when no authorization header', () => {
      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No token provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic sometoken',
      };

      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No token provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 with malformed token', () => {
      mockRequest.headers = {
        authorization: 'Bearer malformed',
      };

      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 with empty token', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should attach user data to request object', () => {
      const payload = { userId: 'testUser', userPass: 'testPass' };
      const token = generateToken(payload);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual(expect.objectContaining(payload));
    });

    it('should handle token with extra spaces', () => {
      const token = generateToken({ userId: 'user123', userPass: 'pass123' });
      mockRequest.headers = {
        authorization: `Bearer  ${token}`,
      };

      authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
