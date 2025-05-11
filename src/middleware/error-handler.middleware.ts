import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/api.error';
import { CustomLogger } from '../logger';

export const errorHandler = (logger: CustomLogger) => (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}; 