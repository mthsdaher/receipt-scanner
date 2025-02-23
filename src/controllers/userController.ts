// src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { Password } from '../utils/password';
import crypto from 'crypto'; // For generating reset tokens
// Extend the Request interface to include currentUser

declare module 'express' {
  interface Request {
    currentUser?: {
      id: string;
      email: string;
    };
  }}

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

//Controller to delete a user
export const deleteUser = async (req:Request, res:Response): Promise<void> => {
  try{
    //Get user ID from authenticated user (assuming currentUser middleware sets req.currentUser)
    const currentUser = req.currentUser;
    if(!currentUser){
      res.status(401).json({status: 'error', message: 'Not authenticated'});
      return;
    }

    res.status(200).json({ status: 'success', message: 'User deleted!' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }};

// Controller to reset a user's password
export const passwordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword, resetToken } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    // Verify reset token (simplified: assume token is sent via email or query param)
    // In a real app, you’d store the reset token in the user document with an expiration
    const storedToken = user.resetToken; // You’d need to add this field to User.ts
    const tokenExpiration = user.resetTokenExpires; // And this field

    if (!storedToken || !tokenExpiration || new Date() > tokenExpiration) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired reset token' });
      return;
    }

    // Verify the provided reset token matches (simplified: hash-based comparison)
    const isTokenValid = crypto.timingSafeEqual(
      Buffer.from(resetToken),
      Buffer.from(storedToken)
    );
    if (!isTokenValid) {
      res.status(400).json({ status: 'error', message: 'Invalid reset token' });
      return;
    }

    // Hash the new password
    const hashedPassword = await Password.toHash(newPassword);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
// Controller to request a password reset
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    // Generate a reset token (random string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiration

    // Store the token and expiration in the user document
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // In a real app, send an email with the reset link (e.g., http://localhost:3002/api/users/reset-password?token=resetToken)
    // For now, log the token for testing
    console.log(`Reset token for ${email}: ${resetToken} (expires at ${resetTokenExpires})`);

    res.status(200).json({ status: 'success', message: 'Password reset link sent (check logs for token)' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};