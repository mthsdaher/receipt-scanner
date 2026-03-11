import { Request, Response } from "express";
import { UnauthorizedError } from "../errors/AppError";
// express-validator uses CommonJS; import via require for compatibility
const { validationResult } = require("express-validator");
import { ReceiptService } from "../services/ReceiptService";
import { asyncHandler } from "../middleware/asyncHandler";

/**
 * Controllers: HTTP boundary only.
 * - Extract/validate input from req
 * - Delegate to service
 * - Format response
 * Errors propagate to errorHandler middleware.
 */

const createReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errors;
  }

  const currentUser = req.currentUser;
  if (!currentUser?.id) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const { amount, date, description, category } = req.body;

  const receipt = await ReceiptService.create({
    userId: currentUser.id,
    amount,
    date: date ? new Date(date) : new Date(),
    description,
    category,
  });

  res.status(201).json({
    status: "success",
    data: receipt,
  });
});

const getUserReceipts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.currentUser;
  const requestedUserId = req.params.userId;

  ReceiptService.assertCanAccess(requestedUserId, currentUser?.id);

  const receipts = await ReceiptService.findByUserId(requestedUserId);
  res.json({
    status: "success",
    data: receipts,
  });
});

/** Placeholder: real OCR integration would go here */
const scanReceipt = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const { calculateReceiptTotal } = await import("../utils/functions");
  const simulatedData = {
    seller: "Example Store",
    date: "2023-10-25",
    items: ["Item 1", "Item 2"],
    value: 100,
    taxes: 10,
    totalValue: calculateReceiptTotal(100, 10),
  };
  res.status(200).json({
    status: "success",
    data: simulatedData,
  });
});

export { createReceipt, getUserReceipts, scanReceipt };
