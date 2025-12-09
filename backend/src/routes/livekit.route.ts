import express, { Request, Response, Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware.js';

const router: Router = express.Router();

// Initialize LiveKit credentials from environment
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

// Validate required environment variables
if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn('⚠️  Warning: Missing LiveKit environment variables (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET). LiveKit endpoints will fail until configured.');
}

/**
 * Generate LiveKit access token for a participant
 * POST /api/livekit/token
 */
router.post('/token', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if LiveKit is configured
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      res.status(503).json({
        success: false,
        error: 'LiveKit service is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables.',
      });
      return;
    }

    const { room, username, metadata } = req.body;

    if (!room || !username) {
      res.status(400).json({
        success: false,
        error: 'Room and username are required',
      });
      return;
    }

    // Create access token with identity and metadata
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: username,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
    
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({
      success: true,
      token,
      url: LIVEKIT_URL,
      room,
      username,
    });
  } catch (error: any) {
    console.error('Error generating token:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate token',
    });
  }
});

/**
 * Join a LiveKit-powered session (AI live or human handoff)
 * POST /api/livekit/join
 * Body: { roomType: "ai_live" | "human_handoff", roomName?, sessionPreferences?, metadata? }
 */
router.post('/join', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      res.status(503).json({
        success: false,
        error: 'LiveKit service is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.',
      });
      return;
    }

    const userId = req.user?.uuid || 'anonymous';
    const {
      roomType = 'ai_live',
      roomName,
      sessionPreferences = {},
      metadata = {},
    } = req.body || {};

    const normalizedRoom = roomName || `${roomType}-${userId}-${Date.now()}`;

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      metadata: JSON.stringify({
        ...metadata,
        mode: roomType,
        preferences: sessionPreferences,
      }),
    });

    at.addGrant({
      room: normalizedRoom,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({
      success: true,
      livekitToken: token,
      roomName: normalizedRoom,
      mode: roomType,
      url: LIVEKIT_URL,
    });
  } catch (error: any) {
    console.error('Error joining LiveKit session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to join LiveKit session',
    });
  }
});

/**
 * Get LiveKit configuration
 * GET /api/livekit/config
 */
router.get('/config', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    liveKitUrl: LIVEKIT_URL,
    // Don't expose API credentials to client
  });
});

/**
 * List active rooms
 * GET /api/livekit/rooms
 */
router.get('/rooms', async (_req: Request, res: Response): Promise<void> => {
  try {
    // This would require LiveKit server SDK
    // For now, return mock data
    res.json({
      success: true,
      rooms: [
        {
          name: 'ai-wellness-chat',
          emptyTimeout: 300,
          creationTime: Date.now(),
          numParticipants: 1,
        },
      ],
    });
  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
