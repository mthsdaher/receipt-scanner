import { Router } from 'express';
import { createReceipt, getUserReceipts } from '../controllers/receiptController';
const { body, validationResult } = require('express-validator');
import { scanReceipt } from '../controllers/receiptController';

const router = Router();

// POST /api/receipts - Create a new receipt with validation
router.post(
  '/',
  [
    body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid User ID'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('date').isISO8601().withMessage('Date must be in ISO format'),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('category').optional().trim(),
  ],
  createReceipt
);

// GET /api/receipts/:userId - List all receipts for a user
router.get('/:userId', getUserReceipts);

router.post('/scan', scanReceipt);

export default router;