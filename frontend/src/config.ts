// Loads from root .env file (NEXT_PUBLIC_ prefix required for client-side access)
export const config = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://bus7ag2jn7be5hq2oc7rvsyw3u0tojid.lambda-url.eu-north-1.on.aws",
    appName: "Serene Mind",
    env: process.env.NODE_ENV || "production"
};
