import { Request, Response } from "express";
import User from "../models/User";

const { validationResult } = require("express-validator");

// Controller to create a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract data from the request body
    const { fullName, age, email, cellNumber } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // Create and save the new user
    const user = new User({ fullName, age, email, cellNumber });
    await user.save();

    // Return the created user
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to list all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Fetch all users from the database
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
