import { Request, Response } from "express";
import User, { UserStatus } from "../models/User";
import jwt from "jsonwebtoken";
import { Password } from "../utils/password";
import crypto from "crypto";
import { generateVerificationCode } from "../utils/verificationCode";
import { sendVerificationEmail } from "../utils/email";
const { validationResult } = require('express-validator');

/**
 * Controller to signup (create) a new user with pending activation status
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: "error", errors: errors.array() });
    return;
  }

  try {
    const { fullName, age, email, cellNumber, password } = req.body;
    const hashedPassword = await Password.toHash(password);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .status(400)
        .json({ status: "error", message: "Email already registered" });
      return;
    }

    const verificationCode = generateVerificationCode();
    const expiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

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

    // send the verification code via email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      status: "success",
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 controller to login an existing user (only if activated)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    const isPasswordMatch = await Password.compare(user.password, password);
    if (!isPasswordMatch) {
      res.status(400).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    if (user.status !== UserStatus.Active) {
      res
        .status(403)
        .json({
          status: "error",
          message: "Account not activated. Please verify your account.",
        });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      user: {
        fullName: user.fullName,
        age: user.age,
        email: user.email,
        cellNumber: user.cellNumber,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Controller to list all users (excluding sensitive fields)
 */
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select(
      "-password -verifCd -expDt -resetToken -resetTokenExpires"
    );
    res.json({ status: "success", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Controller to delete a user by email
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ status: "error", message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    await User.deleteOne({ email });
    res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user by email:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Controller to request a password reset (generates token, logs it)
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }
    if (user.status !== UserStatus.Active) {
      res
        .status(403)
        .json({ status: "error", message: "Account not activated" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    console.log(
      `Reset token for ${email}: ${resetToken} (expires at ${user.resetTokenExpires})`
    );

    res.status(200).json({
      status: "success",
      message: "Password reset token generated. Check server logs.",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Controller to reset password using token
 */
export const passwordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, newPassword, resetToken } = req.body;
    const user = await User.findOne({ email }).select(
      "+resetToken +resetTokenExpires"
    );
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }
    if (
      !user.resetToken ||
      new Date() > (user.resetTokenExpires as Date) ||
      !crypto.timingSafeEqual(Buffer.from(resetToken), Buffer.from(user.resetToken))
    ) {
      res
        .status(400)
        .json({ status: "error", message: "Invalid or expired reset token" });
      return;
    }

    user.password = await Password.toHash(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Controller to resend verification code
 */
export const resendVerificationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ status: "error", message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }
    if (user.status === UserStatus.Active) {
      res
        .status(400)
        .json({ status: "error", message: "User already activated" });
      return;
    }

    const newCode = generateVerificationCode();
    user.verifCd = newCode;
    user.expDt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, newCode);

    res.status(200).json({
      status: "success",
      message: "Verification code resent. Please check your email.",
    });
  } catch (error) {
    console.error("Error resending code:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * POST /api/users/validate-code
 * - Verifies that the supplied code matches what was emailed.
 * - Activates the user if valid.
 * - Returns a JWT so the frontend can stay logged in.
 */
export const validateCode = async (req: Request, res: Response): Promise<void> => {
  const { email, code } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ status: "error", message: "Invalid email or code" });
    return;
  }

  // 2. Check code match
  if (user.verifCd !== code) {
    res.status(400).json({ status: "error", message: "Invalid email or code" });
    return;
  }

  // 3. Check expiration
  if (!user.expDt || new Date() > user.expDt) {
    res.status(400).json({ status: "error", message: "Code expired" });
    return;
  }

  // 4. Activate account
  user.status = UserStatus.Active;
  user.verifCd = undefined;
  user.expDt = undefined;
  await user.save();

  // 5. Issue JWT
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" }
  );

  res.status(200).json({
    status: "success",
    message: "Account activated",
    token,
  });
};