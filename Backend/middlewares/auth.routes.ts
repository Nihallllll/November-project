import { Router, type Request, type Response } from 'express';

import { logger } from '../utils/logger';
import { AuthService } from '../services/auth.services';

const router = Router();

/**
 * POST /auth/register
 * Create new user account
 */
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Register user
    const result = await AuthService.register(email, password);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token
      },
      message: 'User registered successfully'
    });

  } catch (error: any) {
    logger.error('Registration failed:', error);
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /auth/login
 * Login with email & password
 * Returns JWT token
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Login user
    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token
      },
      message: 'Login successful'
    });

  } catch (error: any) {
    logger.error('Login failed:', error);

    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /auth/refresh
 * Get a new token using old token
 * Useful for long-running sessions
 */
router.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }

    const newToken = AuthService.refreshToken(token);

    res.json({
      success: true,
      data: {
        token: newToken
      },
      message: 'Token refreshed'
    });

  } catch (error: any) {
    logger.error('Token refresh failed:', error);

    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (frontend should delete token)
 */
router.post('/auth/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Please delete token from your client.'
  });
});

export default router;
