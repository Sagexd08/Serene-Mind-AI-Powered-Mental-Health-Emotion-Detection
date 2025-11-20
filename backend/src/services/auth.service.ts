import type { user } from "../types/auth.types.js";
import { connectToDB } from "../db/connect.js";

const mockUsers = new Map<string, user>(); // key: uuid
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

// Seed one user so login works
mockUsers.set("123e4567-e89b-12d3-a456-426614174000", {
  uuid: "123e4567-e89b-12d3-a456-426614174000",
  id: "demoUser",
  password: "demoPass",
});

// 1) Verify Credentials
async function verifyUserCredentials(
  userId: string,
  userPass: string
): Promise<user | null> {
  await new Promise((r) => setTimeout(r, 100));

  const user = Array.from(mockUsers.values()).find(
    (u) => u.id === userId && u.password === userPass
  );

  return user || null;
}

// 2) Save Refresh Token
async function saveRefreshToken(
  token: string,
  userId: string,
  expiresAt: Date
) {
  await new Promise((r) => setTimeout(r, 50));
  refreshTokens.set(token, { userId, expiresAt });
}

// 3) Invalidate Refresh Token
async function invalidateRefreshToken(token: string) {
  await new Promise((r) => setTimeout(r, 50));
  refreshTokens.delete(token);
}

// 4) Find user by refresh token
async function findUserByRefreshToken(token: string) {
  await new Promise((r) => setTimeout(r, 50));

  const entry = refreshTokens.get(token);
  if (!entry) return null;

  const user = Array.from(mockUsers.values()).find(
    (u) => u.id === entry.userId
  );
  return user || null;
}

// 5) Get user by UUID
async function getUserByUuid(uuid: string) {
  await new Promise((r) => setTimeout(r, 50));
  return mockUsers.get(uuid) || null;
}



async function getRefreshToken(token: string) {
  const db = await connectToDB();
  const result = await db.query(
    "SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1",
    [token]
  );
  return result.rows[0] || null;
}

async function getUser(userId: string, userPass: string) {
  const db = await connectToDB();
  const user = db.query("SELECT * FROM users WHERE id = $1 AND password = $2", [
    userId,
    userPass,
  ]);
  return user.rows[0] || null;
}

async function getUserByUUID(UUID: string) {
  const db = await connectToDB();
  const user = db.query("SELECT * FROM users WHERE uuid = $1", [UUID]);
  return user.rows[0] || null;
}

export { getUser, getUserByUUID };

export { getRefreshToken };

export {
  verifyUserCredentials,
  saveRefreshToken,
  invalidateRefreshToken,
  findUserByRefreshToken,
  getUserByUuid,
};
