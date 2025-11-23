import { Request, Response } from "express";
import { generateEncrytionDecrytionKeys } from "../utils/crypto";

export const getEncrytion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "UserId is required" });
      return;
    }

    const { encryptionKey, decryptionKey } = generateEncrytionDecrytionKeys({});

    res.status(202).json({
      encryptionKey: encryptionKey,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to queue request" });
  }
};
