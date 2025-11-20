import { Request, Response } from "express";
import { generateToken } from "../utils/jwt.js";
import { requestQueue } from "../config/queue.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userPass } = req.body;

    if (!userId || !userPass) {
      res.status(400).json({ error: "userId and userPass are required" });
      return;
    }

    const token = generateToken({ userId, userPass });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const processRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { encryptedData, targetUrl } = req.body;

    if (!encryptedData || !targetUrl) {
      res.status(400).json({ error: "encryptedData and targetUrl are required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const job = await requestQueue.add({
      encryptedData,
      userId: req.user.userId,
      userPass: req.user.userPass,
      targetUrl,
    });

    res.status(202).json({
      message: "Request queued successfully",
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to queue request" });
  }
};
