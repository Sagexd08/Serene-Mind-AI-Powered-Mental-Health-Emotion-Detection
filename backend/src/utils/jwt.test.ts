import { generateToken, verifyToken, JWTPayload } from './jwt';

describe('JWT Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload: JWTPayload = {
        userId: 'user123',
        userPass: 'pass123',
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate different tokens for different payloads', () => {
      const payload1: JWTPayload = { userId: 'user1', userPass: 'pass1' };
      const payload2: JWTPayload = { userId: 'user2', userPass: 'pass2' };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload: JWTPayload = {
        userId: 'user123',
        userPass: 'pass123',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.userPass).toBe(payload.userPass);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => verifyToken(malformedToken)).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow();
    });

    it('should handle tokens with special characters in payload', () => {
      const payload: JWTPayload = {
        userId: 'user!@#$%',
        userPass: 'pass^&*()',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.userPass).toBe(payload.userPass);
    });

    it('should roundtrip encode and decode successfully', () => {
      const payload: JWTPayload = {
        userId: 'testUser',
        userPass: 'testPassword123',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(payload);
    });
  });
});
