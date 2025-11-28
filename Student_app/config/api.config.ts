/**
 * API Configuration
 *
 * Update the API_BASE_URL to point to your university's API endpoint
 */

const API_CONFIG = {
  // Base URL for the university API
  // Example: 'https://api.university.edu' or 'https://your-university-api.com/api'
  BASE_URL: "http://192.168.1.4:3000",

  // API Endpoints
  ENDPOINTS: {
    LOGIN: "/auth/login",
    FACE_UPLOAD: "/face/upload",
    LOGOUT: "/auth/logout",
    PROFILE: "/student/profile",
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

/**
 * Update this URL to match your university's API endpoint
 *
 * Example configuration for different environments:
 *
 * Development:
 * BASE_URL: 'http://localhost:3000/api'
 *
 * Staging:
 * BASE_URL: 'https://staging-api.university.edu/api'
 *
 * Production:
 * BASE_URL: 'https://api.university.edu/api'
 */

export { API_CONFIG };
export default API_CONFIG;
