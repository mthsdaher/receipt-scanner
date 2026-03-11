import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface UserPayload {
  id: string;
  email: string;
}

declare module 'express' {
  interface Request {
    currentUser?: UserPayload;
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    req.currentUser = undefined;
    return next();
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    req.currentUser = payload; // Attach user payload to request
    next();
  } catch (error) {
    req.currentUser = undefined; // Invalid token, no user
    next();
  }
};