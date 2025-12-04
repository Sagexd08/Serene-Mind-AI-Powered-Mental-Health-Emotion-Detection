const API_CONFIG = {
  BASE_URL: "http://192.168.1.4:3000",
  // change this accoding to the base ip of laptop hit ipconfig in cmd find something like wireless lan adapter wifi connection
  // then find the ipv4 address and replace it with this only the ip not the port port is 3000

  ENDPOINTS: {
    LOGIN: "/auth/login",
    FACE_UPLOAD: "/face/upload",
    LOGOUT: "/auth/logout",
    PROFILE: "/student/profile",
  },

  TIMEOUT: 30000,

  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};
export { API_CONFIG };
export default API_CONFIG;
