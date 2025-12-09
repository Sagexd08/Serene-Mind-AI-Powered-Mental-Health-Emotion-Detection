import express, { Request, Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware.js';
import { connectToDB } from '../db/connect.js';

const router: Router = express.Router();

/**
 * Request a handoff to a human counselor
 * POST /api/handoff/request
 */
router.post('/request', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectToDB();
    const handoffId = `handoff-${Date.now()}`;
    const userId = req.user?.uuid || 'anonymous';
    const { preferredMode = 'immediate', reason, scheduleTime, includeTranscript } = req.body || {};

    const status = preferredMode === 'immediate' ? 'connecting' : 'scheduled';
    const createdAt = new Date().toISOString();

    if (db.driver === 'postgres') {
      await db.query(
        `INSERT INTO handoffs (handoff_id, user_id, status, reason, preferred_mode, schedule_time, include_transcript, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [handoffId, userId, status, reason, preferredMode, scheduleTime, includeTranscript, createdAt]
      );
    } else if (db.driver === 'sqlite') {
      await db.run(
        `INSERT INTO handoffs (handoff_id, user_id, status, reason, preferred_mode, schedule_time, include_transcript, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [handoffId, userId, status, reason, preferredMode, scheduleTime, includeTranscript, createdAt]
      );
    }

    res.json({ handoffId, status, estimatedWait: preferredMode === 'immediate' ? 120 : null });
  } catch (error: any) {
    console.error('Error creating handoff:', error);
    res.status(500).json({ error: error.message || 'Failed to create handoff' });
  }
});

/**
 * Transfer handoff to a counselor room
 * POST /api/handoff/transfer
 */
router.post('/transfer', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectToDB();
    const { handoffId, livekitRoom } = req.body || {};

    if (!handoffId || !livekitRoom) {
      res.status(400).json({ error: 'handoffId and livekitRoom are required' });
      return;
    }

    if (db.driver === 'postgres') {
      const result = await db.query(
        `UPDATE handoffs SET status = 'connected', livekit_room = $1 WHERE handoff_id = $2 RETURNING *`,
        [livekitRoom, handoffId]
      );
      if (!result.rows || result.rows.length === 0) {
        res.status(404).json({ error: 'handoff not found' });
        return;
      }
    } else if (db.driver === 'sqlite') {
      await db.run(
        `UPDATE handoffs SET status = 'connected', livekit_room = ? WHERE handoff_id = ?`,
        [livekitRoom, handoffId]
      );
    }

    res.json({ handoffId, status: 'connected', livekitRoom });
  } catch (error: any) {
    console.error('Error transferring handoff:', error);
    res.status(500).json({ error: error.message || 'Failed to transfer handoff' });
  }
});

/**
 * Get handoff status
 * GET /api/handoff/:handoffId/status
 */
router.get('/:handoffId/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectToDB();
    const { handoffId } = req.params;

    let record;
    if (db.driver === 'postgres') {
      const result = await db.query(
        `SELECT * FROM handoffs WHERE handoff_id = $1`,
        [handoffId]
      );
      record = result.rows?.[0];
    } else if (db.driver === 'sqlite') {
      const result = await db.query(
        `SELECT * FROM handoffs WHERE handoff_id = ?`,
        [handoffId]
      );
      record = Array.isArray(result) ? result[0] : result;
    }

    if (!record) {
      res.status(404).json({ error: 'handoff not found' });
      return;
    }

    res.json({ handoffId, ...record });
  } catch (error: any) {
    console.error('Error fetching handoff status:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch handoff status' });
  }
});

/**
 * Share transcript with consent
 * POST /api/handoff/transcript/share
 */
router.post('/transcript/share', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = await connectToDB();
    const { handoffId, transcript, emotionMetrics, consentFlags } = req.body || {};

    if (!handoffId) {
      res.status(400).json({ error: 'handoffId is required' });
      return;
    }

    // TODO: Encrypt transcript before storing (use AES256)
    const transcriptJson = transcript ? JSON.stringify(transcript) : null;
    const emotionMetricsJson = emotionMetrics ? JSON.stringify(emotionMetrics) : null;
    const consentFlagsJson = consentFlags ? JSON.stringify(consentFlags) : null;

    if (db.driver === 'postgres') {
      await db.query(
        `UPDATE handoffs SET transcript = $1, emotion_metrics = $2, consent_flags = $3 WHERE handoff_id = $4`,
        [transcriptJson, emotionMetricsJson, consentFlagsJson, handoffId]
      );
    } else if (db.driver === 'sqlite') {
      await db.run(
        `UPDATE handoffs SET transcript = ?, emotion_metrics = ?, consent_flags = ? WHERE handoff_id = ?`,
        [transcriptJson, emotionMetricsJson, consentFlagsJson, handoffId]
      );
    }

    res.json({ success: true, handoffId });
  } catch (error: any) {
    console.error('Error sharing transcript:', error);
    res.status(500).json({ error: error.message || 'Failed to share transcript' });
  }
});

export default router;
