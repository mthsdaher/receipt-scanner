import { Router } from "express";
import {
  signup,
  login,
  getUsers,
  deleteUser,
  passwordReset,
  requestPasswordReset,
} from "../controllers/userController";
const { validationResult } = require("express-validator");
const { check } = require("express-validator");
import { currentUser } from "../middleware/current-user";

const router = Router(); // Move this to the top and remove the duplicate declaration

// POST /api/users/signup - Register a new user
router.post(
  "/signup",
  [
    check("fullName").notEmpty().withMessage("Full name is required"),
    check("age").isNumeric().withMessage("Age must be a number"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("cellNumber").notEmpty().withMessage("Cell number is required"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)"
      ),
  ],
  signup
);

// POST /api/users/login - Login an existing user
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// GET /api/users - List all users
router.get("/", getUsers);

// DELETE /api/users/deleteUser - Delete the current authenticated user
router.delete("/deleteUser", currentUser, deleteUser);

// POST /api/users/reset-request - Request a password reset
router.post(
  "/reset-request",
  [check("email").isEmail().withMessage("Valid email is required")],
  requestPasswordReset
);

// POST /api/users/reset-password - Reset a user's password
router.post(
  "/reset-password",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
      )
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)"
      ),
    check("resetToken").notEmpty().withMessage("Reset token is required"),
  ],
  passwordReset
);

export default router;
