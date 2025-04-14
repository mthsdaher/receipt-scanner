// src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { Password } from '../utils/password';
import crypto from 'crypto'; // For generating reset tokens
import { generateVerificationCode } from '../utils/verificationCode';
import { UserStatus } from '../models/User';

const { validationResult } = require('express-validator');

// Controller to signup (create) a new user with pending activation status
export const signup = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: 'error', errors: errors.array( ) });
    return;
  }

  try {
    const { fullName, age, email, cellNumber, password } = req.body;
    const hashedPassword = await Password.toHash(password);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'Email already registered' });
      return;
    }

    const verificationCode = generateVerificationCode();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes (for manual verification)

    const user = new User({
      fullName,
      age,
      email,
      cellNumber,
      password: hashedPassword,
      verifCd: verificationCode, // Store verification code for manual verification
      expDt: expiration,
      status: UserStatus.Pending_Activation, // User starts as pending activation
    });
    await user.save();

    // Return the user (excluding sensitive fields) with a message for manual verification
    res.status(201).json({
      status: 'success',
      message: 'User created. Manually verify the user by setting status to "Active" in the database or via API (e.g., validateCode endpoint).',
      user: { fullName, age, email, cellNumber, verificationCode },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to login an existing user (only if activated)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email (including password)
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

    // Check if user is activated
    if (user.status !== UserStatus.Active) {
      res.status(403).json({ status: 'error', message: 'Account not activated. Please verify your account manually.' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Return the user (excluding password) and token
    res.json({ user: { fullName: user.fullName, age: user.age, email: user.email, cellNumber: user.cellNumber }, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to list all users (unchanged, excluding sensitive fields)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -verifCd -expDt -resetToken -resetTokenExpires');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to delete a user (only if activated)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = req.currentUser;
    if (!currentUser || !currentUser.id) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(currentUser.id).select('status');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (user.status !== UserStatus.Active) {
      res.status(403).json({ status: 'error', message: 'Account not activated. Cannot delete.' });
      return;
    }

    await User.findByIdAndDelete(currentUser.id);
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to reset a user's password (only if activated)
export const passwordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword, resetToken } = req.body;

    const user = await User.findOne({ email }).select('+password +resetToken +resetTokenExpires');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (user.status !== UserStatus.Active) {
      res.status(403).json({ status: 'error', message: 'Account not activated. Cannot reset password.' });
      return;
    }

    const storedToken = user.resetToken;
    const tokenExpiration = user.resetTokenExpires;

    if (!storedToken || !tokenExpiration || new Date() > tokenExpiration) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired reset token' });
      return;
    }

    const isTokenValid = crypto.timingSafeEqual(
      Buffer.from(resetToken),
      Buffer.from(storedToken)
    );
    if (!isTokenValid) {
      res.status(400).json({ status: 'error', message: 'Invalid reset token' });
      return;
    }

    const hashedPassword = await Password.toHash(newPassword);

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

// Controller to request a password reset (only if activated)
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (user.status !== UserStatus.Active) {
      res.status(403).json({ status: 'error', message: 'Account not activated. Cannot request password reset.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiration

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // For simplicity, log the reset token (since we removed Nodemailer)
    console.log(`Reset token for ${email}: ${resetToken} (expires at ${resetTokenExpires})`);

    res.status(200).json({ status: 'success', message: 'Password reset token generated. Check server logs for the token.' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to manually validate a user (simplified verification without email)
export const validateCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ status: 'error', message: 'Missing mandatory field' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid email' });
      return;
    }

    if (user.verifCd !== code) {
      res.status(400).json({ status: 'error', message: 'Invalid code' });
      return;
    }

    if (new Date() > user.expDt!) {
      res.status(400).json({ status: 'error', message: 'Code expired' });
      return;
    }

    if (user.status === UserStatus.Pending_Activation) {
      user.status = UserStatus.Active;
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.status(200).json({
        status: 'success',
        message: 'Code validated. Account activated.',
        token,
      });
    } else {
      res.status(200).json({ status: 'success', message: 'Code validated, but account already active.' });
    }
  } catch (error) {
    console.error('Error validating verification code:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};