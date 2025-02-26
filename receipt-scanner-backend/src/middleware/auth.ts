import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string }; // extend Request to include user data
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    req.user = { id: decoded.id }; // Attach user to request
    next(); // Proceed to next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

export default auth;