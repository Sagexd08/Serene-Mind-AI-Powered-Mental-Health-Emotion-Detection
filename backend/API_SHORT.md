Short API Reference

Base URL: http://localhost:3000

Auth:

- POST /auth/register {userId, userPass} -> 201 (accessToken, refreshToken)
- POST /auth/login {userId, userPass} -> 200 (accessToken, refreshToken)
- POST /auth/refresh {refreshToken} -> 200 (accessToken)
- POST /auth/logout {refreshToken} -> 200
- POST /auth/me (Authorization: Bearer <token>) -> 200 (user)

Encryption:

- POST /encryption (Authorization: Bearer <token>) -> 200 {encryptionKey}

Submit:

- POST /api/submit (Authorization: Bearer <token>) {encryptedData} -> 202 {jobId}

Notes: Use `Authorization: Bearer <accessToken>` for protected routes.
