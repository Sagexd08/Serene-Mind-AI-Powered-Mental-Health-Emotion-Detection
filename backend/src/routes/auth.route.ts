import { Router } from "express";
import { login, processRequest } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/process", authMiddleware, processRequest);

export default router;
