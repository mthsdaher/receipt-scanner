/**
 * Base application error with HTTP status and structured message.
 * Enables consistent error handling across controllers and middleware.
 *
 * Design rationale: Using a class hierarchy allows `instanceof` checks in
 * error handlers and provides a predictable contract for API error responses.
 * Extending Error correctly (setting name, preserving stack) ensures
 * compatibility with logging and debugging tools.
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      status: 'error',
      message: this.message,
    };
  }
}

/** 400 - Client sent invalid data (validation, malformed request) */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/** 401 - Missing or invalid authentication */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** 403 - Authenticated but not allowed to perform action */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/** 404 - Resource not found */
export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

/** 409 - Conflict (e.g., duplicate email on signup) */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/** 503 - Service temporarily unavailable (e.g., AI features not configured) */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}
