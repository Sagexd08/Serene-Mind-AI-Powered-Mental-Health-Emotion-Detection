import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { getRefreshToken } from "../services/auth.service";

//
// LOAD RSA KEYS
//
const privateKey = fs.readFileSync(path.join(process.cwd(), "keys", "private.key"), "utf8");

const publicKey = fs.readFileSync(path.join(process.cwd(), "keys", "public.key"), "utf8");

//
// TOKEN LIFETIMES
//
const ACCESS_TOKEN_EXP = "10m"; // Short-lived
const REFRESH_TOKEN_EXP_DAYS = 14; // Because refresh is opaque (DB stored)

//
// PAYLOAD TYPE
//
export interface JWTPayload {
  sub: string; // user ID
  uuid: string; // user UUID
  jti: string; // unique token ID
  iat?: number;
  exp?: number;
}

//
// ACCESS TOKEN GENERATION (JWT RS256)
//
export const generateAccessToken = (UUID: string): string => {
  const jti = crypto.randomUUID();

  const payload: JWTPayload = {
    sub: UUID,
    uuid: UUID,
    jti,
  };

  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: ACCESS_TOKEN_EXP,
  });
};

//
// ACCESS TOKEN VERIFICATION
//
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as JWTPayload;
  } catch (err) {
    throw new Error("Invalid or expired access token");
  }
};

//
// REFRESH TOKEN GENERATION (OPAQUE TOKEN)
//
export const generateRefreshToken = (): {
  token: string;
  expiresAt: Date;
} => {
  const token = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXP_DAYS);

  return { token, expiresAt };
};

//
// REFRESH TOKEN VERIFICATION
// (MUST BE MATCHED AGAINST DB/REDIS)
//
export const verifyRefreshToken = async (token: string): Promise<{ valid: boolean; userId?: string }> => {
  try {
    const record = await getRefreshToken(token);

    if (!record) {
      return { valid: false };
    }

    // Check if token is expired
    const expiresAt = new Date(record.expires_at);
    if (expiresAt < new Date()) {
      return { valid: false };
    }

    return { valid: true, userId: record.user_id };
  } catch (error) {
    return { valid: false };
  }
};
