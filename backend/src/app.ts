import "dotenv/config";
import express from "express";
import cors from "cors";

import homeRouter from "./routes/home.route.js";
import healthRoutes from "./routes/health.route.js";
import authRouter from "./routes/auth.route.js";
import encryptionRouter from "./routes/encryption.route.js";
import submitRouter from "./routes/submit.route.js";
import chatRouter from "./routes/chat.route.js";
import livekitRouter from "./routes/livekit.route.js";

import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

// Configure JSON parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configure CORS with allowed origins from environment
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(requestLogger);

app.use("/", homeRouter);
app.use("/health", healthRoutes);
app.use("/auth", authRouter);
app.use("/encryption", encryptionRouter);
app.use("/api/submit", submitRouter);
app.use("/api/chat", chatRouter);
app.use("/api/livekit", livekitRouter);

app.use(errorHandler);
