// Import necessary modules from Express and custom utility
import { Request, Response } from 'express';
import Receipt from '../models/Receipt';
import User from '../models/User';
import { calculateReceiptTotal } from '../utils/functions';
const { validationResult } = require('express-validator');

// Controller to create a new receipt
export const createReceipt = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate incoming request data against predefined rules
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    // Extract receipt data from the request body
    const currentUser = req.currentUser;
    if(!currentUser || !currentUser.id) {
      res.status(401).json({ message: 'Unauthorized. Token missing or invalid' });
      return;
    }

    const { amount, date, description, category } = req.body;

    const user = await User.findById(currentUser.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Calculate the total value assuming 'amount' is the product value and 'taxes' (not provided) is a fixed rate or needs to be derived
    const totalValue = calculateReceiptTotal(amount, 13); // Example: 10% tax rate; adjust based on your data structure

    // Create and save the new receipt with calculated total value
    const receipt = new Receipt({
      amount, // Store the original amount (product value)
      totalValue, // Store the calculated total value
      date,
      description,
      category,
    });
    await receipt.save();

    // Return the created receipt in the response
    res.status(201).json(receipt);
  } catch (error) {
    // Log any errors and return a server error response
    console.error('Error creating receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller to list all receipts for a user (secured)
export const getUserReceipts = async (req: Request, res: Response) => {
  try {
    const currentUser = req.currentUser;
    const requestedUserId = req.params.userId;

    if (!currentUser || currentUser.id !== requestedUserId) {
      res.status(403).json({ message: 'Forbidden: You cannot view receipts of other users.' });
      return;
    }

    const receipts = await Receipt.find({ userId: requestedUserId }).sort({ date: -1 });
    res.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Controller to scan and process a receipt image
export const scanReceipt = async (req: Request, res: Response) => {
  try {
    // Simulate OCR processing (replace with actual Tesseract.js logic later)
    const simulatedData = {
      seller: 'Example Store',
      date: '2023-10-25',
      items: ['Item 1', 'Item 2'],
      value: 100, // Product value
      taxes: 10, // Tax rate in percentage or fixed amount (adjust as needed)
      totalValue: calculateReceiptTotal(100, 10), // Calculate total using utility function (10% tax rate)
    };
    // Return the simulated receipt data with calculated total
    res.status(200).json(simulatedData);
  } catch (error) {
    // Log any errors and return a server error response
    console.error('Error processing receipt scan:', error);
    res.status(500).json({ message: 'Server error during receipt scan' });
  }
};