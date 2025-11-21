# API Documentation

## Base URL
```
http://localhost:3000
```

## Overview

This API provides authentication, user management, and asynchronous data processing capabilities. It uses JWT tokens for authentication and Bull queues for background job processing.

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Register a new user and receive authentication tokens.

**Request Body:**
```json
{
  "userId": "string",
  "userPass": "string"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "uuid": "user-uuid-here",
    "userId": "username",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: userId and userPass are required
- `409`: User already exists
- `500`: Registration failed

---

### 2. Login
**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "userId": "string",
  "userPass": "string"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "uuid": "user-uuid-here",
    "userId": "username",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: userId and userPass are required
- `401`: Invalid credentials
- `500`: Failed to login

---

### 3. Refresh Token
**POST** `/auth/refresh`

Refresh an expired access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: refreshToken is required
- `401`: Invalid or expired refresh token / Refresh token not recognized
- `500`: Failed to refresh token

---

### 4. Logout
**POST** `/auth/logout`

Invalidate a refresh token to log out the user.

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `400`: refreshToken is required
- `500`: Logout failed

---

### 5. Get Current User
**POST** `/auth/me`

Get information about the currently authenticated user. Requires authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "uuid": "user-uuid-here",
  "userId": "username",
  "email": "user@example.com"
}
```

**Error Responses:**
- `401`: No token provided / Invalid or expired token / Unauthorized
- `404`: User not found
- `500`: Failed to get user info

---

## Data Processing Endpoints

### 6. Submit Request
**POST** `/api/submit`

Submit encrypted data for asynchronous processing. Requires authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "encryptedData": "encrypted-string-here",
  "targetUrl": "https://example.com/api/endpoint"
}
```

**Response (202):**
```json
{
  "message": "Request queued successfully",
  "jobId": "1"
}
```

**Error Responses:**
- `400`: encryptedData and targetUrl are required
- `401`: No token provided / Invalid or expired token / Unauthorized
- `500`: Failed to queue request

**Processing Flow:**
1. Request is queued in Bull queue
2. Background worker decrypts the data
3. Decrypted data is sent to the target URL with user UUID:
```json
{
  "data": "decrypted-data-here",
  "userId": "user-uuid"
}
```

---

## Health & Status Endpoints

### 7. Health Check
**GET** `/health`

Check API health status and uptime.

**Response (200):**
```json
{
  "status": "ok",
  "uptime": 12345.67,
  "timestamp": 1703001234567
}
```

---

### 8. Welcome
**GET** `/`

Root endpoint to verify API is running.

**Response (200):**
```json
{
  "message": "Welcome"
}
```

---

## Authentication Flow

1. **Register/Login**: Call `/auth/register` or `/auth/login` to receive:
   - `accessToken`: Short-lived JWT for API requests
   - `refreshToken`: Long-lived token to refresh access tokens

2. **Make Authenticated Requests**: Include access token in Authorization header:
   ```
   Authorization: Bearer <accessToken>
   ```

3. **Refresh Access Token**: When access token expires, use `/auth/refresh` with refresh token

4. **Logout**: Call `/auth/logout` with refresh token to invalidate it

---

## Data Processing Flow

```
Client → Register/Login → Receive Tokens
Client → Encrypt Data → Encrypted String
Client → POST /api/submit (with Access Token) → Job Queued
Background Worker → Decrypt Data → Send to Target URL
Target URL Receives: { data: "...", userId: "..." }
```

---

## Environment Variables

Required environment variables:

```env
PORT=3000
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d
ENCRYPTION_KEY=64-char-hex-string
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Setup database
npm run setup-db

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Notes

- All endpoints accept and return JSON
- Access tokens are short-lived (default 1 hour)
- Refresh tokens are long-lived (default 7 days)
- Data encryption/decryption uses AES-256-CBC
- Background jobs are processed using Bull queue with Redis
- CORS is enabled for all origins in development