import { Router } from "express";
const { body } = require("express-validator");
import { postAiQuery } from "../controllers/aiController";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
import { receiptReadRateLimiter } from "../middleware/rate-limiters";

const router = Router();

/**
 * POST /api/ai/query
 * Ask a natural-language question about your receipts.
 * Body: { question: string }
 */
router.post(
  "/query",
  currentUser,
  requireAuth,
  receiptReadRateLimiter,
  [
    body("question")
      .notEmpty()
      .withMessage("question is required")
      .trim()
      .isLength({ max: 500 })
      .withMessage("question must be at most 500 characters"),
  ],
  postAiQuery
);

export default router;
