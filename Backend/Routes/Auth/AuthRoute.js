import express from "express";
import { 
  login, 
  init, 
  register, 
  verifyEmail, 
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile
} from "../../Controller/index.js";
import { authenticateToken } from "../../Middleware/token-middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes (require authentication)
router.get("/init", authenticateToken, init);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);

export { router as authRouter };