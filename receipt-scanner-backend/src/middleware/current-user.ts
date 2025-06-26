
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// Extend the Request interface to include currentUser
declare module 'express' {
  interface Request {
    currentUser?: UserPayload;
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    req.currentUser = undefined; // No token, no user
    return next();
  }

  try {
    // Verify token using JWT_SECRET from .env
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
    req.currentUser = payload; // Attach user payload to request
    next();
  } catch (error) {
    req.currentUser = undefined; // Invalid token, no user
    next();
  }
};