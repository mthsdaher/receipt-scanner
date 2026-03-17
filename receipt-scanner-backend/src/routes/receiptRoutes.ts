import { Router } from 'express';
import { createReceipt, getUserReceipts, scanReceipt } from '../controllers/receiptController';
import { currentUser } from '../middleware/current-user';
import { requireAuth } from '../middleware/require-auth';
import {
  receiptReadRateLimiter,
  receiptWriteRateLimiter,
} from '../middleware/rate-limiters';
const { body, param } = require('express-validator');

const router = Router();

// POST /api/receipts - Create a new receipt with validation
router.post(
  '/',
  currentUser,
  requireAuth,
  receiptWriteRateLimiter,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
    body('date').isISO8601({ strict: true }).withMessage('Date must be in ISO format'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .trim()
      .isLength({ max: 255 })
      .withMessage('Description must be at most 255 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 80 })
      .withMessage('Category must be at most 80 characters'),
    body('subtotal')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Subtotal must be a non-negative number'),
    body('tax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax must be a non-negative number'),
  ],
  createReceipt
);

// GET /api/receipts/:userId - List all receipts for a user
router.get(
  '/:userId',
  currentUser,
  requireAuth,
  receiptReadRateLimiter,
  [param('userId').isUUID().withMessage('userId must be a valid UUID')],
  getUserReceipts
);

// Simulated OCR scan
router.post('/scan', currentUser, requireAuth, receiptWriteRateLimiter, scanReceipt);

export default router;