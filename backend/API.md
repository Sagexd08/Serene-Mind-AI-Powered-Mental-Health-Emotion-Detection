# API Endpoints

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Login
**POST** `/auth/login`

Get JWT token by providing user credentials.

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: userId and userPass are required
- `500`: Login failed

---

### 2. Process Request
**POST** `/auth/process`

Submit encrypted data for processing. Requires JWT authentication.

**Headers:**
```
Authorization: Bearer <token>
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
  "jobId": "job-123"
}
```

**Error Responses:**
- `400`: encryptedData and targetUrl are required
- `401`: No token provided / Invalid or expired token / Unauthorized
- `500`: Failed to queue request

---

## Flow

1. **Login**: Call `/auth/login` with userId and userPass to receive JWT token
2. **Encrypt Data**: Encrypt your sensitive data using the encryption utility
3. **Process**: Send encrypted data to `/auth/process` with:
   - JWT token in Authorization header
   - Encrypted data in request body
   - Target URL where decrypted data should be sent
4. **Queue Processing**: System will:
   - Decrypt the data
   - Send decrypted data + userId + userPass to target URL
   - Process asynchronously via Bull queue

---

## Data Flow

```
Client → /auth/login → JWT Token
Client → Encrypt Data → Encrypted String
Client → /auth/process (with Token) → Queue Job
Queue Processor → Decrypt Data → Send to Target URL
```

The target URL receives:
```json
{
  "data": "decrypted-data-here",
  "userId": "user-id-from-jwt",
  "userPass": "user-pass-from-jwt"
}
```

---

## Environment Variables

```
PORT=3000
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=24h
ENCRYPTION_KEY=64-char-hex-string
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Testing

Run tests:
```bash
npm test
```

Run server:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Start production:
```bash
npm start
```
