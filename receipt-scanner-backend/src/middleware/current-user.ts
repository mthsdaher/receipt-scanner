import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { setRequestContextUserId } from "../utils/requestContext";

interface UserPayload {
  id: string;
  email: string;
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    req.currentUser = undefined;
    setRequestContextUserId(undefined);
    return next();
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    req.currentUser = payload;
    setRequestContextUserId(payload.id);
    next();
  } catch {
    req.currentUser = undefined;
    setRequestContextUserId(undefined);
    next();
  }
};