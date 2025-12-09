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
}

// Export singleton instance
export const livekitService = new LiveKitService();
export default livekitService;
