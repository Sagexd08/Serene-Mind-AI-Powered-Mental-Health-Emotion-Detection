import { Router } from "express";
import { getSubmit } from "../controllers/submit.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/api/submit", authMiddleware, getSubmit);
