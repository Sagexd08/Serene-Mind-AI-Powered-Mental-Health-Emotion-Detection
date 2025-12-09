import { API_CONFIG } from "@/config/api.config";
import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

// Types
export interface ChatMessage {
  id: string;
  studentId: string;
  counselorId?: string;
  content: string;
  sender: 'student' | 'counselor';
  timestamp: Date;
  chatMode: 'ai' | 'human';
  read: boolean;
}

export interface Counselor {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  available: boolean;
  responseTime: string;
}

export interface CounselorRequestResponse {
  success: boolean;
  assigned?: boolean;
  queued?: boolean;
  counselor?: Counselor;
  sessionId?: string;
  position?: number;
  estimatedWait?: string;
  message?: string;
  error?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: ChatMessage;
  delivered?: boolean;
  error?: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  messages: ChatMessage[];
  total: number;
}

export interface QueueStatusResponse {
  success: boolean;
  inQueue: boolean;
  position?: number;
  estimatedWait?: string;
  priority?: 'normal' | 'urgent';
}

class ChatService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private async getAuthHeaders() {
    const token = await SecureStore.getItemAsync("accessToken");
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get list of available counselors
   */
  async getAvailableCounselors(): Promise<{ success: boolean; data: Counselor[]; totalAvailable: number }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.get('/api/chat/counselors', { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching counselors:', error);
      return { success: false, data: [], totalAvailable: 0 };
    }
  }

  /**
   * Request to chat with a human counselor
   */
  async requestCounselor(
    studentId: string,
    mood?: string,
    message?: string,
    priority: 'normal' | 'urgent' = 'normal'
  ): Promise<CounselorRequestResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.post(
        '/api/chat/request-counselor',
        { studentId, mood, message, priority },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error requesting counselor:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a message to counselor
   */
  async sendMessage(
    studentId: string,
    content: string,
    counselorId?: string,
    chatMode: 'ai' | 'human' = 'human'
  ): Promise<SendMessageResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.post(
        '/api/chat/send',
        { studentId, content, counselorId, chatMode },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get chat history with a counselor
   */
  async getChatHistory(
    studentId: string,
    counselorId?: string,
    limit: number = 50
  ): Promise<ChatHistoryResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const params = counselorId ? { counselorId, limit: limit.toString() } : { limit: limit.toString() };
      const response = await this.axiosInstance.get(`/api/chat/history/${studentId}`, {
        headers,
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
      return { success: false, messages: [], total: 0 };
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    studentId: string,
    messageIds: string[],
    counselorId?: string
  ): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.post(
        '/api/chat/read',
        { studentId, messageIds, counselorId },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      return { success: false };
    }
  }

  /**
   * End chat session
   */
  async endChatSession(sessionId?: string, studentId?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.post(
        '/api/chat/end-session',
        { sessionId, studentId },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error ending chat session:', error);
      return { success: false };
    }
  }

  /**
   * Get queue status for student
   */
  async getQueueStatus(studentId: string): Promise<QueueStatusResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.get(`/api/chat/queue-status/${studentId}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching queue status:', error);
      return { success: false, inQueue: false };
    }
  }

  /**
   * Get counselor information
   */
  async getCounselorInfo(counselorId: string): Promise<{ success: boolean; counselor?: Counselor }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.get(`/api/chat/counselor/${counselorId}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching counselor info:', error);
      return { success: false };
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
