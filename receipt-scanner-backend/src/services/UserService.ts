/**
 * UserService – Domain logic layer for user operations.
 *
 * Design: Single Responsibility – encapsulates all user-related business rules.
 * Controllers remain thin: validation → call service → respond.
 *
 * Error handling: Throws AppError subtypes for predictable API responses.
 */
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserStatus } from "../models/User";
import { Password } from "../utils/password";
import { generateVerificationCode } from "../utils/verificationCode";
import * as userDb from "../db/users";
import { env } from "../config/env";
import { MailService } from "./MailService";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../errors/AppError";

export interface SignupInput {
  fullName: string;
  age: number;
  email: string;
  cellNumber: string;
  password: string;
}

export interface SignupResult {
  verificationCode?: string; // Only in development; production sends via email
}

export interface LoginResult {
  user: { fullName: string; age: number; email: string; cellNumber: string };
  token: string;
}

export interface ValidateCodeResult {
  token: string;
}

export interface RequestPasswordResetResult {
  resetToken?: string;
}

export class UserService {
  /**
   * Creates a pending user and returns verification code.
   * In production, the code MUST be sent via email/SMS, not in the API response.
   */
  static async signup(input: SignupInput): Promise<SignupResult> {
    const existingUser = await userDb.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const verificationCode = generateVerificationCode();
    const expiration = new Date(Date.now() + 5 * 60 * 1000);

    await userDb.createUser({
      fullName: input.fullName,
      age: input.age,
      email: input.email,
      cellNumber: input.cellNumber,
      password: await Password.toHash(input.password),
      verifCd: verificationCode,
      expDt: expiration,
      status: UserStatus.Pending_Activation,
    });

    // Security: In production, send via email. Exposing in API is for dev/demo only.
    if (env.NODE_ENV !== "production") {
      return { verificationCode };
    }
    return {};
  }

  static async login(email: string, password: string): Promise<LoginResult> {
    const user = await userDb.findUserByEmail(email, true);
    if (!user || !user.password) {
      throw new BadRequestError("Invalid credentials");
    }

    const isMatch = await Password.compare(user.password, password);
    if (!isMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    if (user.status !== UserStatus.Active) {
      throw new ForbiddenError(
        "Account not activated. Please verify your account."
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      user: {
        fullName: user.fullName,
        age: user.age,
        email: user.email,
        cellNumber: user.cellNumber,
      },
      token,
    };
  }

  static async getUsers() {
    return userDb.findAllUsers();
  }

  static async deleteUser(email: string): Promise<void> {
    const user = await userDb.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await userDb.deleteUserByEmail(email);
  }

  /**
   * Generates reset token and persists it. Does NOT log it (security).
   * In production, send the token via email.
   */
  static async requestPasswordReset(email: string): Promise<RequestPasswordResetResult> {
    const user = await userDb.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (user.status !== UserStatus.Active) {
      throw new ForbiddenError("Account not activated");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    await userDb.updateUser(email, {
      resetToken,
      resetTokenExpires,
    });

    // Optional SMTP integration (portfolio/demo): send only when configured.
    if (MailService.isConfigured()) {
      await MailService.sendPasswordResetEmail(email, resetToken);
      return {};
    }

    // Security: Never log reset tokens. Expose token only for local development tests.
    if (env.NODE_ENV !== "production") {
      return { resetToken };
    }
    return {};
  }

  static async passwordReset(
    email: string,
    newPassword: string,
    resetToken: string
  ): Promise<void> {
    const user = await userDb.findUserByEmail(email, true);
    if (!user || !user.resetToken) {
      throw new NotFoundError("User not found");
    }
    if (typeof user.resetToken !== "string") {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const providedToken = Buffer.from(resetToken);
    const storedToken = Buffer.from(user.resetToken);
    const tokensMatch =
      providedToken.length === storedToken.length &&
      crypto.timingSafeEqual(providedToken, storedToken);

    if (
      !user.resetTokenExpires ||
      new Date() > new Date(user.resetTokenExpires) ||
      !tokensMatch
    ) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const hashedPassword = await Password.toHash(newPassword);
    await userDb.updateUser(email, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });
  }

  static async resendVerificationCode(email: string): Promise<{ verificationCode?: string }> {
    const user = await userDb.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (user.status === UserStatus.Active) {
      throw new BadRequestError("User already activated");
    }

    const newCode = generateVerificationCode();
    const expDt = new Date(Date.now() + 5 * 60 * 1000);
    await userDb.updateUser(email, { verifCd: newCode, expDt });

    if (env.NODE_ENV !== "production") {
      return { verificationCode: newCode };
    }
    return {};
  }

  static async loginOrCreateWithGoogle(googleEmail: string, googleName: string): Promise<{ token: string }> {
    let user = await userDb.findUserByEmail(googleEmail);
    if (!user) {
      const randomPassword = await Password.toHash(crypto.randomBytes(32).toString("hex"));
      user = await userDb.createOAuthUser({
        fullName: googleName || "Google User",
        email: googleEmail,
        password: randomPassword,
      });
    }
    if (user.status !== UserStatus.Active) {
      await userDb.updateUser(googleEmail, { status: UserStatus.Active });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { token };
  }

  static async validateCode(email: string, code: string): Promise<ValidateCodeResult> {
    const user = await userDb.findUserByEmail(email, true);
    if (!user) {
      throw new BadRequestError("Invalid email or code");
    }
    if (user.verifCd !== code) {
      throw new BadRequestError("Invalid email or code");
    }

    const expDt =
      user.expDt instanceof Date
        ? user.expDt
        : user.expDt
        ? new Date(user.expDt)
        : null;
    if (!expDt || new Date() > expDt) {
      throw new BadRequestError("Code expired");
    }

    await userDb.updateUser(email, {
      status: UserStatus.Active,
      verifCd: null,
      expDt: null,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token };
  }
}
