import { Router } from "express";
const { body } = require("express-validator");
import { getAiHealth, postAiChat, postAiQuery } from "../controllers/aiController";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
import { receiptReadRateLimiter } from "../middleware/rate-limiters";

const router = Router();

/**
 * GET /api/ai/health
 * Check if AI features are available (OpenAI key, pgvector).
 */
router.get("/health", getAiHealth);

/**
 * POST /api/ai/query
 * Ask a natural-language question about your receipts (RAG).
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

/**
 * POST /api/ai/chat
 * Agentic chat: add receipts, list, search via natural language.
 * Body: { message: string }
 */
router.post(
  "/chat",
  currentUser,
  requireAuth,
  receiptReadRateLimiter,
  [
    body("message")
      .notEmpty()
      .withMessage("message is required")
      .trim()
      .isLength({ max: 1000 })
      .withMessage("message must be at most 1000 characters"),
  ],
  postAiChat
);

export default router;
