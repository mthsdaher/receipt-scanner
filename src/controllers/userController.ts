// src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { Password } from '../utils/password';

const { validationResult } = require('express-validator');

// Controller to signup (create) a new user
export const signup = async (req: Request, res: Response): Promise<void> => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: 'error', errors: errors.array() });
    return;
  }

  try {
    // Extract data from the request body
    const { fullName, age, email, cellNumber, password } = req.body;

    // Hash the password before saving
    const hashedPassword = await Password.toHash(password);

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'Email already in use' });
      return;
    }

    // Create and save the new user with hashed password
    const user = new User({ fullName, age, email, cellNumber, password: hashedPassword });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return the user (excluding password) and token
    res.status(201).json({ user: { fullName, age, email, cellNumber }, token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to login an existing user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email (excluding password by default, so we use .select('+password'))
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(400).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isPasswordMatch = await Password.compare(user.password, password);
    if (!isPasswordMatch) {
      res.status(400).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return the user (excluding password) and token
    res.json({ user: { fullName: user.fullName, age: user.age, email: user.email, cellNumber: user.cellNumber }, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to list all users (unchanged, but exclude password)
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Fetch all users from the database, excluding password
    const users = await User.find().select('-password'); // Exclude password from results
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};