import { Router } from 'express';
import { createReceipt, getUserReceipts, scanReceipt } from '../controllers/receiptController';
import { currentUser } from '../middleware/current-user';
const { body } = require('express-validator');

const router = Router();

// POST /api/receipts - Create a new receipt with validation
router.post(
  '/',
  currentUser,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('date').isISO8601().withMessage('Date must be in ISO format'),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('category').optional().trim(),
  ],
  createReceipt
);

// GET /api/receipts/:userId - List all receipts for a user
router.get('/:userId', currentUser, getUserReceipts);

// Simulated OCR scan
router.post('/scan', scanReceipt);

export default router;