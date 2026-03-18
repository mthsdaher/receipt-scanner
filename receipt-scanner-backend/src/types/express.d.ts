/**
 * Express Request augmentation.
 * Centralizes requestId (from logger) and currentUser (from auth) for type safety.
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      currentUser?: { id: string; email: string };
    }
  }
}

export {};
