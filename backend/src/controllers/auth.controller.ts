import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import {
  saveRefreshToken,
  verifyUserCredentials,
  invalidateRefreshToken,
  findUserByRefreshToken,
  getUserByUuid
} from "../services/auth.service.js";

import type { user as userType } from "../types/auth.types.js";

// LOGIN
async function getLogin(req: Request, res: Response): Promise<void> {
  try {
    const { userId, userPass } = req.body;

    if (!userId || !userPass) {
      res.status(400).json({ error: "userId and userPass are required" });
      return;
    }

    const user: userType | null = await verifyUserCredentials(userId, userPass);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.uuid);
    const { token: refreshToken, expiresAt } = generateRefreshToken();

    await saveRefreshToken(refreshToken, user.id, expiresAt);

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
}

// REGISTER
async function getRegister(req: Request, res: Response): Promise<void> {
  try {
    const { userId, userPass } = req.body;
    if (!userId || !userPass) {
      res.status(400).json({ error: "userId and userPass are required" });
      return;
    }

    // you add user in DB here

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
}

// REFRESH ACCESS TOKEN
async function getRefresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }

    const verified = await verifyRefreshToken(refreshToken);
    if (!verified.valid) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const stored = await findUserByRefreshToken(refreshToken);
    if (!stored) {
      res.status(401).json({ error: "Refresh token not recognized" });
      return;
    }

    const user = await getUserByUuid(stored.uuid);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(user.uuid);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
}

// LOGOUT
async function getLogout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }

    await invalidateRefreshToken(refreshToken);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
}

// ME (requires auth middleware)
async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded.valid || !decoded.uuid) {
      res.status(401).json({ error: "Invalid access token" });
      return;
    }

    const user = await getUserByUuid(decoded.uuid);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      uuid: user.uuid,
      userId: user.userId,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user info" });
  }
}



export {
  getLogin,
  getRegister,
  getRefresh,
  getLogout,
  getMe,
};
