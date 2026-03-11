import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

const sendRateLimitResponse = (
  req: Request,
  res: Response,
  statusCode: number,
  message: string
): void => {
  const requestId = (req as Request & { requestId?: string }).requestId ?? "unknown";
  res.status(statusCode).json({
    status: "error",
    code: "RATE_LIMITED",
    message,
    requestId,
  });
};

/**
 * Broad limiter to reduce abusive traffic across API routes.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendRateLimitResponse(req, res, 429, "Too many requests. Please try again later.");
  },
});

/**
 * Stricter limiter for authentication-related endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendRateLimitResponse(
      req,
      res,
      429,
      "Too many authentication attempts. Please try again later."
    );
  },
});

/**
 * Dedicated limiter for OCR endpoint due to high processing cost.
 */
export const ocrRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendRateLimitResponse(req, res, 429, "Too many OCR requests. Please wait and try again.");
  },
});

/**
 * Limits write operations on receipts to reduce abuse and accidental floods.
 */
export const receiptWriteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendRateLimitResponse(
      req,
      res,
      429,
      "Too many receipt write requests. Please wait and try again."
    );
  },
});

/**
 * Limits read operations on receipts.
 */
export const receiptReadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendRateLimitResponse(
      req,
      res,
      429,
      "Too many receipt read requests. Please wait and try again."
    );
  },
});

