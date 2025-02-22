import { Router } from "express";
import { createUser, getUsers } from "../controllers/userController";

const { body, validationResult } = require("express-validator");

const router = Router();

// POST /api/users - Create a new user with validation
router.post(
  "/",
  [
    body("fullName").notEmpty().withMessage("Full name is required").trim(),
    body("age").isInt({ min: 0 }).withMessage("Age must be a positive number"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("cellNumber").notEmpty().withMessage("Cell number is required").trim(),
  ],
  createUser
);

// GET /api/users - List all users
router.get("/", getUsers);

export default router;
