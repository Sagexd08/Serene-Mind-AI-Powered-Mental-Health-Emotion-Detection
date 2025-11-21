import { API_CONFIG } from "@/config/api.config";
import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

export interface LoginCredentials {
  userId: string;
  userPass: string;
}

export interface User {
  uuid: string;
  userId: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface FaceUploadPayload {
  faceImage: string; // Base64 encoded encrypted face image
  accessToken: string;
}

class ApiService {
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

  /**
   * Login with student credentials (Bypass mode - accepts any credentials)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Bypass mode - accept any credentials and generate mock tokens
      console.log(
        "Login bypass mode - accepting credentials for userId:",
        credentials.userId
      );

      const mockResponse: AuthResponse = {
        message: "User registered successfully",
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIiIiwiaWF0IjoxNjMyNzI5MjAwfQ.mock_token",
        refreshToken: "550e8400-e29b-41d4-a716-446655440000",
        user: {
          uuid: `user-${credentials.userId}-${Date.now()}`,
          userId: credentials.userId,
          email: `${credentials.userId}@university.edu`,
        },
      };

      // Store tokens securely
      await this.storeAuthTokens(mockResponse);
      console.log("Login successful with bypass mode");

      return mockResponse;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed. Please try again.");
    }
  }

  /**
   * Upload encrypted face image
   */
  async uploadFaceImage(
    encryptedImage: string,
    accessToken: string
  ): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        API_CONFIG.ENDPOINTS.FACE_UPLOAD,
        {
          faceImage: encryptedImage,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Face upload error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to upload face image."
      );
    }
  }

  /**
   * Store authentication tokens securely
   */
  private async storeAuthTokens(authData: AuthResponse): Promise<void> {
    try {
      await SecureStore.setItemAsync("accessToken", authData.accessToken);
      await SecureStore.setItemAsync("refreshToken", authData.refreshToken);
      await SecureStore.setItemAsync("userId", authData.user.userId);
      await SecureStore.setItemAsync("userUuid", authData.user.uuid);
      await SecureStore.setItemAsync("userEmail", authData.user.email);
    } catch (error) {
      console.error("Error storing auth tokens:", error);
      throw new Error("Failed to store authentication tokens securely.");
    }
  }

  /**
   * Retrieve stored authentication tokens
   */
  async getStoredAuthTokens(): Promise<AuthResponse | null> {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const userId = await SecureStore.getItemAsync("userId");
      const userUuid = await SecureStore.getItemAsync("userUuid");
      const userEmail = await SecureStore.getItemAsync("userEmail");

      if (accessToken && refreshToken && userId && userUuid && userEmail) {
        return {
          message: "User authenticated",
          accessToken,
          refreshToken,
          user: {
            uuid: userUuid,
            userId,
            email: userEmail,
          },
        };
      }

      return null;
    } catch (error) {
      console.error("Error retrieving auth tokens:", error);
      return null;
    }
  }

  /**
   * Clear stored authentication tokens (logout)
   */
  async clearAuthTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("userUuid");
      await SecureStore.deleteItemAsync("userEmail");
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getStoredAuthTokens();
    return tokens !== null;
  }
}

export default new ApiService();
