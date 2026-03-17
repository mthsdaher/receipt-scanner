import { Request, Response } from "express";
import { UnauthorizedError } from "../errors/AppError";
const { validationResult } = require("express-validator");
import { queryReceipts } from "../services/RagService";
import { asyncHandler } from "../middleware/asyncHandler";

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

export { postAiQuery };
