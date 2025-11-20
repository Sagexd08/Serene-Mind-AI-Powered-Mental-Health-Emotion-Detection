import { Response } from "express";
import { requestQueue } from "../config/queue.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getSubmit = async (req: AuthRequest, res: Response): Promise<void> => {
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
      userId: req.user.uuid,
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
