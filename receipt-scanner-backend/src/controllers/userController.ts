/**
 * User controllers: HTTP boundary only.
 * - Validate input (express-validator)
 * - Delegate to UserService
 * - Format response
 *
 * Errors propagate to errorHandler via asyncHandler.
 */
import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { asyncHandler } from "../middleware/asyncHandler";

const { validationResult } = require("express-validator");

/** Throws validation result so errorHandler can format it. */
function requireValid(req: Request): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errors;
  }
}

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireValid(req);
  const { fullName, age, email, cellNumber, password } = req.body;

  const result = await UserService.signup({
    fullName,
    age,
    email,
    cellNumber,
    password,
  });

  res.status(201).json({
    status: "success",
    message: "User created. Use the code to activate your account.",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireValid(req);
  const { email, password } = req.body;

  const result = await UserService.login(email, password);

  res.json({
    status: "success",
    data: {
      user: result.user,
      token: result.token,
    },
  });
});

export const getUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const users = await UserService.getUsers();
  res.json({ status: "success", data: users });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireValid(req);
  const { email } = req.body;

  await UserService.deleteUser(email);
  res.status(200).json({ status: "success", message: "User deleted successfully", data: null });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireValid(req);
  const { email } = req.body;

  const result = await UserService.requestPasswordReset(email);
  res.status(200).json({
    status: "success",
    message: "If the account exists and is active, check your email for reset instructions.",
    data: result,
  });
});

export const passwordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireValid(req);
  const { email, newPassword, resetToken } = req.body;

  await UserService.passwordReset(email, newPassword, resetToken);
  res.status(200).json({ status: "success", message: "Password reset successfully", data: null });
});

export const resendVerificationCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireValid(req);
  const { email } = req.body;

  const result = await UserService.resendVerificationCode(email);
  res.status(200).json({
    status: "success",
    message: "Verification code resent.",
    data: result,
  });
});

export const validateCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireValid(req);
  const { email, code } = req.body;

  const { token } = await UserService.validateCode(email, code);
  res.status(200).json({
    status: "success",
    message: "Account activated",
    data: { token },
  });
});
