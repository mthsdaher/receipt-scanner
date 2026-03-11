import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/AppError";

/**
 * Enforces authentication for protected routes.
 *
 * currentUser middleware must run before this middleware so req.currentUser
 * is populated when Authorization token is valid.
 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.currentUser?.id) {
    throw new UnauthorizedError("Not authenticated");
  }
  next();
};

