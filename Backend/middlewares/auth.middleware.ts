import type{ Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import { AuthService } from '../services/auth.services';

/**
 * Authentication Middleware
 * 
 * Runs BEFORE each protected route
 * Checks if user has valid JWT token
 * Attaches userId to request if valid
 */

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer eyJhbGc..."
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('No authorization header provided');
      return res.status(401).json({
        success: false,
        error: 'Missing authorization header'
      });
    }

    // Extract token from "Bearer {token}"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('Invalid authorization header format');
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format. Use: Bearer {token}'
      });
    }

    const token = parts[1];

    // Verify token
    const payload = AuthService.verifyToken(token!);

    // Attach to request
    req.userId = payload.userId;
    req.email = payload.email;

    logger.info(`✅ User authenticated: ${payload.email}`);

    // Continue to next middleware/route
    next();

  } catch (error: any) {
    logger.error(`❌ Authentication failed: ${error.message}`);

    res.status(403).json({
      success: false,
      error: error.message || 'Authentication failed'
    });
  }
};

/**
 * Optional middleware: Log who did what
 * Useful for audit trails
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.userId) {
    logger.info({
      userId: req.userId,
      method: req.method,
      path: req.path,
      ip: req.ip
    }, 'API Request');
  }
  next();
};
