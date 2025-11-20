import { Router } from "express";
import {
  getLogin,
  getRegister,
  getLogout,
  getRefresh,
  getMe,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", getRegister);
router.post("/login", getLogin);
router.post("/refresh", getRefresh);
router.post("/logout", getLogout);
router.post("/me", getMe);

export default router;
