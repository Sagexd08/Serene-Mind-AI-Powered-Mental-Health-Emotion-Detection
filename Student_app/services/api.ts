import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "@/config/api.config";

export interface LoginCredentials {
  studentID: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  serviceToken: string;
  encryptionKey: string;
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
   * Login with student credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, credentials);

      // Store tokens securely
      await this.storeAuthTokens(response.data);

      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
  }

  /**
   * Upload encrypted face image
   */
  async uploadFaceImage(encryptedImage: string, accessToken: string): Promise<any> {
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
        },
      );

      return response.data;
    } catch (error: any) {
      console.error("Face upload error:", error);
      throw new Error(error.response?.data?.message || "Failed to upload face image.");
    }
  }

  /**
   * Store authentication tokens securely
   */
  private async storeAuthTokens(authData: AuthResponse): Promise<void> {
    try {
      await SecureStore.setItemAsync("accessToken", authData.accessToken);
      await SecureStore.setItemAsync("serviceToken", authData.serviceToken);
      await SecureStore.setItemAsync("encryptionKey", authData.encryptionKey);
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
      const serviceToken = await SecureStore.getItemAsync("serviceToken");
      const encryptionKey = await SecureStore.getItemAsync("encryptionKey");

      if (accessToken && serviceToken && encryptionKey) {
        return {
          accessToken,
          serviceToken,
          encryptionKey,
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
      await SecureStore.deleteItemAsync("serviceToken");
      await SecureStore.deleteItemAsync("encryptionKey");
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
