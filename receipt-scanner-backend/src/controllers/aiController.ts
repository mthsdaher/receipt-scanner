import { Request, Response } from "express";
import { UnauthorizedError } from "../errors/AppError";
const { validationResult } = require("express-validator");
import { isPgVectorAvailable } from "../config/database";
import { env } from "../config/env";
import { runAgent } from "../services/AgentService";
import { queryReceipts } from "../services/RagService";
import { asyncHandler } from "../middleware/asyncHandler";

/**
 * GET /api/ai/health
 * Check AI features availability (no auth required).
 */
const getAiHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const openaiConfigured = !!(env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim());
  const pgvectorAvailable = await isPgVectorAvailable();

  res.json({
    status: "success",
    data: {
      openai: openaiConfigured ? "configured" : "missing",
      pgvector: pgvectorAvailable ? "available" : "unavailable",
      aiReady: openaiConfigured && pgvectorAvailable,
    },
  });
});

/**
 * POST /api/ai/query
 * Natural-language query over user's receipts (RAG).
 */
const postAiQuery = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errors;
  }

  const currentUser = req.currentUser;
  if (!currentUser?.id) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const { question } = req.body;

  const result = await queryReceipts(currentUser.id, question);

  res.json({
    status: "success",
    data: result,
  });
});

/**
 * POST /api/ai/chat
 * Agentic chat: can add receipts, list, search via natural language.
 */
const postAiChat = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errors;
  }

  const currentUser = req.currentUser;
  if (!currentUser?.id) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const { message } = req.body;

  const result = await runAgent(currentUser.id, message);

  res.json({
    status: "success",
    data: result,
  });
});

export { getAiHealth, postAiChat, postAiQuery };
