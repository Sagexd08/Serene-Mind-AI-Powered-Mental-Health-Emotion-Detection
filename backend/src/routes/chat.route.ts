import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// Types
interface ChatMessage {
  id: string;
  studentId: string;
  counselorId?: string;
  content: string;
  sender: 'student' | 'counselor';
  timestamp: Date;
  chatMode: 'ai' | 'human';
  read: boolean;
}

interface CounselorQueueEntry {
  studentId: string;
  priority: 'normal' | 'urgent';
  timestamp: Date;
  initialMessage?: string;
  mood?: string;
}

interface Counselor {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  available: boolean;
  responseTime: string;
  currentChats: number;
  maxChats: number;
}

// In-memory storage (replace with database in production)
const chatMessages: Map<string, ChatMessage[]> = new Map();
const counselorQueue: CounselorQueueEntry[] = [];
const activeChatSessions: Map<string, { studentId: string; counselorId: string; startTime: Date }> = new Map();

// Mock counselors data
const counselors: Counselor[] = [
  {
    id: 'c1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Anxiety & Stress',
    available: true,
    responseTime: '< 2 min',
    currentChats: 2,
    maxChats: 5,
  },
  {
    id: 'c2',
    name: 'Dr. Michael Chen',
    specialization: 'Depression & Mood',
    available: true,
    responseTime: '< 5 min',
    currentChats: 3,
    maxChats: 5,
  },
  {
    id: 'c3',
    name: 'Dr. Emily Williams',
    specialization: 'Academic Stress',
    available: false,
    responseTime: 'N/A',
    currentChats: 5,
    maxChats: 5,
  },
];

/**
 * Get available counselors
 * GET /api/chat/counselors
 */
router.get('/counselors', (_req: Request, res: Response): void => {
  const availableCounselors = counselors.filter((c) => c.available && c.currentChats < c.maxChats);
  res.json({
    success: true,
    data: availableCounselors,
    totalAvailable: availableCounselors.length,
  });
});

/**
 * Request to chat with a human counselor
 * POST /api/chat/request-counselor
 */
router.post('/request-counselor', (req: Request, res: Response): void => {
  const { studentId, mood, message, priority = 'normal' } = req.body;

  if (!studentId) {
    res.status(400).json({ success: false, error: 'Student ID is required' });
    return;
  }

  // Check if student already in queue
  const existingEntry = counselorQueue.find((e) => e.studentId === studentId);
  if (existingEntry) {
    res.json({
      success: true,
      message: 'Already in queue',
      position: counselorQueue.indexOf(existingEntry) + 1,
      estimatedWait: `${(counselorQueue.indexOf(existingEntry) + 1) * 2} minutes`,
    });
    return;
  }

  // Find available counselor
  const availableCounselor = counselors.find((c) => c.available && c.currentChats < c.maxChats);

  if (availableCounselor) {
    // Assign counselor immediately
    const sessionId = `session_${Date.now()}`;
    activeChatSessions.set(sessionId, {
      studentId,
      counselorId: availableCounselor.id,
      startTime: new Date(),
    });

    availableCounselor.currentChats++;

    res.json({
      success: true,
      assigned: true,
      counselor: {
        id: availableCounselor.id,
        name: availableCounselor.name,
        specialization: availableCounselor.specialization,
        responseTime: availableCounselor.responseTime,
      },
      sessionId,
    });
    return;
  }

  // Add to queue if no counselor available
  const queueEntry: CounselorQueueEntry = {
    studentId,
    priority: priority as 'normal' | 'urgent',
    timestamp: new Date(),
    initialMessage: message,
    mood,
  };

  // Urgent cases go to front
  if (priority === 'urgent') {
    counselorQueue.unshift(queueEntry);
  } else {
    counselorQueue.push(queueEntry);
  }

  const position = counselorQueue.indexOf(queueEntry) + 1;

  res.json({
    success: true,
    assigned: false,
    queued: true,
    position,
    estimatedWait: `${position * 3} minutes`,
    message: 'All counselors are busy. You have been added to the queue.',
  });
});

/**
 * Send a message in human chat mode
 * POST /api/chat/send
 */
router.post('/send', (req: Request, res: Response): void => {
  const { studentId, counselorId, content, chatMode = 'human' } = req.body;

  if (!studentId || !content) {
    res.status(400).json({ success: false, error: 'Student ID and content are required' });
    return;
  }

  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    studentId,
    counselorId,
    content,
    sender: 'student',
    timestamp: new Date(),
    chatMode: chatMode as 'ai' | 'human',
    read: false,
  };

  // Store message
  const chatKey = `${studentId}_${counselorId || 'ai'}`;
  if (!chatMessages.has(chatKey)) {
    chatMessages.set(chatKey, []);
  }
  chatMessages.get(chatKey)!.push(message);

  res.json({
    success: true,
    message,
    delivered: true,
  });
});

/**
 * Get chat history
 * GET /api/chat/history/:studentId
 */
router.get('/history/:studentId', (req: Request, res: Response): void => {
  const { studentId } = req.params;
  const { counselorId, limit = '50' } = req.query;

  const chatKey = `${studentId}_${counselorId || 'ai'}`;
  const messages = chatMessages.get(chatKey) || [];

  const limitNum = parseInt(limit as string, 10);
  const recentMessages = messages.slice(-limitNum);

  res.json({
    success: true,
    messages: recentMessages,
    total: messages.length,
  });
});

/**
 * Mark messages as read
 * POST /api/chat/read
 */
router.post('/read', (req: Request, res: Response): void => {
  const { studentId, counselorId, messageIds } = req.body;

  const chatKey = `${studentId}_${counselorId || 'ai'}`;
  const messages = chatMessages.get(chatKey);

  if (messages) {
    messages.forEach((msg) => {
      if (messageIds.includes(msg.id)) {
        msg.read = true;
      }
    });
  }

  res.json({ success: true });
});

/**
 * End chat session
 * POST /api/chat/end-session
 */
router.post('/end-session', (req: Request, res: Response): void => {
  const { sessionId, studentId } = req.body;

  if (sessionId) {
    const session = activeChatSessions.get(sessionId);
    if (session) {
      // Free up the counselor
      const counselor = counselors.find((c) => c.id === session.counselorId);
      if (counselor && counselor.currentChats > 0) {
        counselor.currentChats--;
      }
      activeChatSessions.delete(sessionId);
    }
  }

  // Remove from queue if present
  const queueIndex = counselorQueue.findIndex((e) => e.studentId === studentId);
  if (queueIndex !== -1) {
    counselorQueue.splice(queueIndex, 1);
  }

  res.json({
    success: true,
    message: 'Chat session ended',
  });
});

/**
 * Get queue status for a student
 * GET /api/chat/queue-status/:studentId
 */
router.get('/queue-status/:studentId', (req: Request, res: Response): void => {
  const { studentId } = req.params;

  const queueEntry = counselorQueue.find((e) => e.studentId === studentId);

  if (!queueEntry) {
    res.json({
      success: true,
      inQueue: false,
    });
    return;
  }

  const position = counselorQueue.indexOf(queueEntry) + 1;

  res.json({
    success: true,
    inQueue: true,
    position,
    estimatedWait: `${position * 3} minutes`,
    priority: queueEntry.priority,
  });
});

/**
 * Get counselor info
 * GET /api/chat/counselor/:counselorId
 */
router.get('/counselor/:counselorId', (req: Request, res: Response): void => {
  const { counselorId } = req.params;

  const counselor = counselors.find((c) => c.id === counselorId);

  if (!counselor) {
    res.status(404).json({ success: false, error: 'Counselor not found' });
    return;
  }

  res.json({
    success: true,
    counselor,
  });
});

export default router;
