import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/api.error';

export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new UnauthorizedError('No authorization header');
  }

  const [type, token] = authHeader.split(' ');
  
  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedError('Invalid authorization header format');
  }

  // For now, we'll just check if the token exists
  // In a real application, you would validate the token's signature and expiration
  if (!token) {
    throw new UnauthorizedError('Invalid token');
  }

  next();
} 