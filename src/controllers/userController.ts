import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { Password } from '../utils/password';
import crypto from 'crypto'; // For generating reset tokens
import { generateVerificationCode } from '../utils/verificationCode';
import { UserStatus } from '../models/User';
import nodemailer from 'nodemailer';

const { validationResult } = require('express-validator');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

// Controller to signup (create) a new user with email confirmation
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
      res.status(400).json({ status: 'error', message: 'Email already registered' });
      return;
    }

    // Generate verification code and set expiration (10 minutes)
    const verificationCode = generateVerificationCode();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create and save the new user with pending activation status
    const user = new User({
      fullName,
      age,
      email,
      cellNumber,
      password: hashedPassword,
      verifCd: verificationCode,
      expDt: expiration,
      status: UserStatus.Pending_Activation,
    });
    await user.save();

    // Send email with verification code using nodemailer
    const verificationLink = `http://localhost:3002/api/users/validate-code?email=${encodeURIComponent(email)}&code=${verificationCode}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Email Verification for Receipt Scanner',
      text: `Please verify your email by entering this code or clicking the link: ${verificationCode}\n${verificationLink}\nThis code expires in 10 minutes.`,
      html: `<p>Please verify your email by entering this code or <a href="${verificationLink}">clicking here</a>: ${verificationCode}</p><p>This code expires in 10 minutes.</p>`,
    });

    // Return the user (excluding sensitive fields)
    res.status(201).json({
      status: 'success',
      message: 'User created. Please verify your email with the code sent.',
      user: { fullName, age, email, cellNumber },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to login an existing user (only if activated)
export const login = async (req: Request, res: Response): Promise<void> => {
  // ... (unchanged from previous version)
};

// Controller to list all users (unchanged)
export const getUsers = async (req: Request, res: Response) => {
  // ... (unchanged from previous version)
};

// Controller to delete a user (unchanged)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  // ... (unchanged from previous version)
};

// Controller to reset a user's password (unchanged)
export const passwordReset = async (req: Request, res: Response): Promise<void> => {
  // ... (unchanged from previous version)
};

// Controller to request a password reset (unchanged)
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  // ... (unchanged from previous version)
};

// Controller to send a verification code for email confirmation
export const sendCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ status: 'error', message: 'Missing mandatory field' });
      return;
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid email' });
      return;
    }

    // Generate a new verification code and set expiration (10 minutes)
    const verificationCode = generateVerificationCode();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new verification code and expiration
    user.verifCd = verificationCode;
    user.expDt = expiration;
    await user.save();

    // Send email with verification code using nodemailer
    const verificationLink = `http://localhost:3002/api/users/validate-code?email=${encodeURIComponent(email)}&code=${verificationCode}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Email Verification Code for Receipt Scanner',
      text: `Please verify your email by entering this code or clicking the link: ${verificationCode}\n${verificationLink}\nThis code expires in 10 minutes.`,
      html: `<p>Please verify your email by entering this code or <a href="${verificationLink}">clicking here</a>: ${verificationCode}</p><p>This code expires in 10 minutes.</p>`,
    });

    res.status(200).json({ status: 'success', message: 'Verification code sent' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to validate the verification code for email confirmation
export const validateCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ status: 'error', message: 'Missing mandatory field' });
      return;
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid email' });
      return;
    }

    // Check if the provided code matches the stored code
    if (user.verifCd !== code) {
      res.status(400).json({ status: 'error', message: 'Invalid code' });
      return;
    }

    // Check if the code has expired
    if (new Date() > user.expDt!) {
      res.status(400).json({ status: 'error', message: 'Code expired' });
      return;
    }

    // Update user status to Active if pending activation
    if (user.status === UserStatus.Pending_Activation) {
      user.status = UserStatus.Active;
      await user.save();

      // Generate JWT for the activated user
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.status(200).json({
        status: 'success',
        message: 'Code validated. Account activated.',
        token, // Return JWT for immediate use
      });
    } else {
      res.status(200).json({ status: 'success', message: 'Code validated, but account already active.' });
    }
  } catch (error) {
    console.error('Error validating verification code:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};