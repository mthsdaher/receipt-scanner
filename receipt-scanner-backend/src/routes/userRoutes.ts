import { Router } from "express";
import {
  signup,
  login,
  getUsers,
  deleteUser,
  passwordReset,
  requestPasswordReset,
  validateCode,
  resendVerificationCode,
} from "../controllers/userController";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
import { authRateLimiter } from "../middleware/rate-limiters";

const { check } = require("express-validator");
const router = Router();

// POST /api/users/signup
router.post(
  "/signup",
  authRateLimiter,
  [
    check("fullName").notEmpty().withMessage("Full name is required"),
    check("age")
      .isInt({ min: 0 })
      .withMessage("Age must be a non‑negative integer"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("cellNumber")
      .notEmpty()
      .withMessage("Cell number is required")
      .matches(/^\d+$/)
      .withMessage("Cell number must contain only digits"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/)
      .withMessage(
        "Password must include uppercase, lowercase, number and special char"
      ),
  ],
  signup
);

// POST /api/users/login
router.post(
  "/login",
  authRateLimiter,
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// GET /api/users
router.get("/", currentUser, requireAuth, getUsers);

// DELETE /api/users/deleteUser
router.delete(
  "/deleteUser",
  currentUser,
  requireAuth,
  [check("email").isEmail().withMessage("Valid email is required")],
  deleteUser
);

// POST /api/users/reset-request
router.post(
  "/reset-request",
  authRateLimiter,
  [check("email").isEmail().withMessage("Valid email is required")],
  requestPasswordReset
);

// POST /api/users/reset-password
router.post(
  "/reset-password",
  authRateLimiter,
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/)
      .withMessage(
        "New password must include uppercase, lowercase, number and special char"
      ),
    check("resetToken").notEmpty().withMessage("Reset token is required"),
  ],
  passwordReset
);

// POST /api/users/resend-code
router.post(
  "/resend-code",
  authRateLimiter,
  [check("email").isEmail().withMessage("Valid email is required")],
  resendVerificationCode
);

router.post(
  "/validate-code",
  authRateLimiter,
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("Code must be 6 digits"),
  ],
  validateCode
);

export default router;
