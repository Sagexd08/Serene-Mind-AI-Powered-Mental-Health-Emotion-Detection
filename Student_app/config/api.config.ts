const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.1.6:3000",
  // Fallback IP for reference
  // FALLBACK_URL: "http://15.207.100.124",

  ENDPOINTS: {
    LOGIN: "/auth/login",
    FACE_UPLOAD: "/face/upload",
    LOGOUT: "/auth/logout",
    PROFILE: "/student/profile",
    REFRESH: "/auth/refresh",
  },

  TIMEOUT: 30000,
  
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "",
  GEMINI_MODEL: process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
  
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",

  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};
export { API_CONFIG };
export default API_CONFIG;
