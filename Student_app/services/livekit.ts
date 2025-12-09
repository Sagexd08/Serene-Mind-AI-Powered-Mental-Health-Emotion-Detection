import { API_CONFIG } from "@/config/api.config";
import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

// Types
export interface LiveKitTokenResponse {
  success: boolean;
  token: string;
  url: string;
  room: string;
  username: string;
  error?: string;
}

export interface LiveKitConfig {
  success: boolean;
  liveKitUrl: string;
}

export interface VoiceMessage {
  id: string;
  content: string;
  timestamp: Date;
  isAI: boolean;
  mood?: string;
}

export interface JoinRequestBody {
  roomType?: 'ai_live' | 'human_handoff';
  roomName?: string;
  sessionPreferences?: {
    ephemeral?: boolean;
    transcribe?: boolean;
    record?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface JoinResponse {
  success: boolean;
  livekitToken: string;
  roomName: string;
  mode: string;
  url: string;
  error?: string;
}

export interface HandoffRequest {
  reason?: string;
  preferredMode?: 'immediate' | 'schedule' | 'callback' | string;
  scheduleTime?: string;
  includeTranscript?: boolean;
}

export interface HandoffResponse {
  handoffId: string;
  status: string;
  estimatedWait?: number | null;
  error?: string;
}
  mood?: string;
}

class LiveKitService {
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
   * Generate a LiveKit access token for voice chat
   */
  async generateToken(
    room: string,
    username: string,
    metadata?: string
  ): Promise<LiveKitTokenResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.post<LiveKitTokenResponse>(
        "/api/livekit/token",
        {
          room,
          username,
          metadata,
        },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error generating LiveKit token:", error);
      return {
        success: false,
        token: "",
        url: "",
        room: "",
        username: "",
        error: error.message,
      };
    }
  }

  /**
   * Get LiveKit configuration
   */
  async getConfig(): Promise<LiveKitConfig> {
    try {
      const response = await this.axiosInstance.get<LiveKitConfig>(
        "/api/livekit/config"
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching LiveKit config:", error);
      return {
        success: false,
        liveKitUrl: "",
      };
    }
  }

  /**
   * Get active rooms
   */
  async getRooms(): Promise<any> {
    try {
      const response = await this.axiosInstance.get("/api/livekit/rooms");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
      return { success: false, rooms: [] };
    }
  }

  /**
   * Create a unique room name for voice chat
   */
  createRoomName(prefix: string = "wellness-chat"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Create a unique username
   */
  createUsername(studentId: string): string {
    return `student-${studentId}-${Date.now()}`;
  }

  /**
   * Join LiveKit session via backend /api/livekit/join
   */
  async joinSession(body: JoinRequestBody): Promise<JoinResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.post<JoinResponse>(
        '/api/livekit/join',
        body,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error joining LiveKit session:', error);
      return {
        success: false,
        livekitToken: '',
        roomName: '',
        mode: body.roomType || 'ai_live',
        url: '',
        error: error.message,
      };
    }
  }

  /**
   * Request human handoff
   */
  async requestHandoff(body: HandoffRequest): Promise<HandoffResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.axiosInstance.post<HandoffResponse>(
        '/api/handoff/request',
        body,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error requesting handoff:', error);
      return {
        handoffId: '',
        status: 'error',
        estimatedWait: null,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const livekitService = new LiveKitService();
export default livekitService;
