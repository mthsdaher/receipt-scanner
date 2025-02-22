import { Request, Response, NextFunction } from 'express';

const logger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request
  console.log(`${req.method} ${req.url} - Started at ${new Date().toISOString()}`);

  // Capture response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.url} - Ended with status ${res.statusCode} in ${duration}ms`);
  });

  next();
};

export default logger;