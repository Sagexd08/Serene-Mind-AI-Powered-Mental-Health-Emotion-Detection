const API_CONFIG = {
  BASE_URL: "http://192.168.1.5:3000",
  // change this accoding to the base ip of laptop hit ipconfig in cmd find something like wireless lan adapter wifi connection
  // then find the ipv4 address and replace it with this only the ip not the port port is 3000

  ENDPOINTS: {
    LOGIN: "/auth/login",
    FACE_UPLOAD: "/face/upload",
    LOGOUT: "/auth/logout",
    PROFILE: "/student/profile",
    REFRESH: "/auth/refresh",
  },

  TIMEOUT: 30000,
  
  GEMINI_API_KEY: "AIzaSyBNoAeUnqJxxGA-iut8xE9osZg5aSaUA6w", // TODO: Replace with actual key
  GEMINI_MODEL: "gemini-2.5-flash",
  
  SUPABASE_URL: "https://uceaqjofeavrmpbsshzs.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_s-9hmcbD0jN1L2V5rTER_w_pOMOPZqF",

  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};
export { API_CONFIG };
export default API_CONFIG;
