import { Request, Response } from "express";
import Receipt from "../models/Receipt";
import User from "../models/User";

const { validationResult } = require("express-validator");

// Controller to create a new receipt
export const createReceipt = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    // Extract data from the request body
    const { userId, amount, date, description, category } = req.body;

    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Create and save the new receipt
    const receipt = new Receipt({
      userId,
      amount,
      date,
      description,
      category,
    });
    await receipt.save();

    // Return the created receipt
    res.status(201).json(receipt);
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to list all receipts for a user
export const getUserReceipts = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId; // Get userId from URL parameter
    const receipts = await Receipt.find({ userId }).sort({ date: -1 }); // Sort by date descending
    res.json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const scanReceipt = async (req: Request, res: Response) => {
  // Simulate OCR processing (replace with actual Tesseract.js logic later)
  const simulatedData = {
    seller: "Example Store",
    date: "2023-10-25",
    items: ["Item 1", "Item 2"],
    value: 100,
    taxes: 10,
    totalValue: 110,
    };
    res.status(200).json(simulatedData);
};
