import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/home.route.js";
import authRouter from "./routes/auth.route.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use("/", router);
app.use("/auth", authRouter);
app.use(errorHandler);
