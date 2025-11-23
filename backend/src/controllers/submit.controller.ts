import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { addJobToQueue } from "../services/queue.processor.js";
import { getDecryptionKey } from "../services/encrytion.service.js";

export const getSubmit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      res.status(400).json({ error: "encryptedData is required" });
      return;
    }

    if (!req.user || !req.user.uuid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = req.user.uuid;

    // Get the most recent decryption key for this user
    const decryptionKeyRecord = await getDecryptionKey(userId);

    if (!decryptionKeyRecord) {
      res
        .status(400)
        .json({
          error: "No decryption key found. Request an encryption key first.",
        });
      return;
    }

    // Check if decryption key has expired
    if (new Date(decryptionKeyRecord.expiary) < new Date()) {
      res
        .status(400)
        .json({
          error: "Decryption key has expired. Request a new encryption key.",
        });
      return;
    }

    // Add job to queue with encrypted data and decryption key
    const jobId = await addJobToQueue({
      encryptedData,
      userId,
      decryptionKey: decryptionKeyRecord.key,
      targetUrl: "", // Not needed but kept for compatibility
    });

    res.status(202).json({
      message: "Request queued successfully",
      jobId,
      userId,
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ error: "Failed to queue request" });
  }
};
