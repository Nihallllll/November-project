import { Router, type Request, type Response } from 'express';
import { logger } from '../utils/logger';
import { AuthService } from '../services/auth.services';

const router = Router();

/**
 * POST /register (not /auth/register)
 * Mounted at /auth, so route is /register
 */
router.post('/register', async (req: Request, res: Response) => {  // ✅ CHANGE FROM '/auth/register' to '/register'
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
 * POST /login (not /auth/login)
 */
router.post('/login', async (req: Request, res: Response) => {  // ✅ CHANGE FROM '/auth/login' to '/login'
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

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
 * POST /refresh
 */
router.post('/refresh', async (req: Request, res: Response) => {  // ✅ CHANGE FROM '/auth/refresh' to '/refresh'
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
      data: { token: newToken },
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
 * POST /logout
 */
router.post('/logout', (req: Request, res: Response) => {  // ✅ CHANGE FROM '/auth/logout' to '/logout'
  res.json({
    success: true,
    message: 'Logged out successfully. Please delete token from your client.'
  });
});

export const authRoutes =  router;
