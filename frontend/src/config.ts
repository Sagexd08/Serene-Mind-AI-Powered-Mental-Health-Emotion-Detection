// Loads from root .env file (NEXT_PUBLIC_ prefix required for client-side access)
export const config = {
    // Prefer API Gateway (public) over Lambda Function URL to avoid auth blocks
    // apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://ogz733hqv9.execute-api.eu-north-1.amazonaws.com/prod",
    apiBaseUrl: "http://localhost:8000",
    apiKey: process.env.NEXT_PUBLIC_API_KEY || "",
    appName: "Serene Mind",
    env: process.env.NODE_ENV || "production"
};
