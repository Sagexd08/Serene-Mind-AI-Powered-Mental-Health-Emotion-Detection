import express, { Request, Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware.js';

const router: Router = express.Router();

// In-memory stub store (replace with DB/workflow queue later)
const handoffStore = new Map<string, any>();

router.post('/request', authMiddleware, async (req: AuthRequest, res: Response) => {
  const handoffId = `handoff-${Date.now()}`;
  const { preferredMode = 'immediate', reason, scheduleTime, includeTranscript } = req.body || {};

  handoffStore.set(handoffId, {
    status: preferredMode === 'immediate' ? 'connecting' : 'scheduled',
    userId: req.user?.uuid,
    reason,
    preferredMode,
    scheduleTime,
    includeTranscript: !!includeTranscript,
    createdAt: new Date().toISOString(),
  });

  res.json({ handoffId, status: handoffStore.get(handoffId).status, estimatedWait: preferredMode === 'immediate' ? 120 : null });
});

router.post('/transfer', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { handoffId, livekitRoom } = req.body || {};
  const record = handoffStore.get(handoffId);
  if (!record) {
    res.status(404).json({ error: 'handoff not found' });
    return;
  }
  handoffStore.set(handoffId, { ...record, status: 'connected', livekitRoom });
  res.json({ handoffId, status: 'connected', livekitRoom });
});

router.get('/:handoffId/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const record = handoffStore.get(req.params.handoffId);
  if (!record) {
    res.status(404).json({ error: 'handoff not found' });
    return;
  }
  res.json({ handoffId: req.params.handoffId, ...record });
});

router.post('/transcript/share', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { handoffId, transcript, emotionMetrics, consentFlags } = req.body || {};
  const record = handoffStore.get(handoffId);
  if (!record) {
    res.status(404).json({ error: 'handoff not found' });
    return;
  }
  // Store consent + transcript pointers (replace with encrypted storage later)
  handoffStore.set(handoffId, {
    ...record,
    transcript: transcript ? '[redacted-in-memory]' : undefined,
    emotionMetrics,
    consentFlags,
  });
  res.json({ success: true });
});

export default router;
