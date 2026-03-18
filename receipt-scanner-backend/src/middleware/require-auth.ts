import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/AppError";

/**
 * Enforces authentication for protected routes.
 *
 * currentUser middleware must run before this middleware so req.currentUser
 * is populated when Authorization token is valid.
 *
 * Uses next(err) so the error handler receives it; throw in sync middleware
 * may not propagate correctly in Express.
 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.currentUser?.id) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }
  next();
};

