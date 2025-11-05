import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { PasswordUtil } from '../utils/password';

/**
 * JWT (JSON Web Token) Authentication Service
 * 
 * How JWT works:
 * 1. User logs in with email + password
 * 2. Server verifies password is correct
 * 3. Server creates a JWT token (signed with secret)
 * 4. Token contains: userId, email, expiration
 * 5. User stores token (localStorage, cookies, etc)
 * 6. User sends token with each request
 * 7. Server verifies token is valid
 * 8. Server allows action if token is valid
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h'; // Token expires in 24 hours

export interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthService {
  
  /**
   * Register a new user
   */
  static async register(email: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate email format
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Hash the password
    const hashedPassword = await PasswordUtil.hash(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true
      }
    });

    console.log(`✅ User registered: ${email}`);

    // Generate JWT token for immediate login
    const token = this.generateToken(user.id, user.email);

    return {
      user,
      token
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.verify(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    console.log(`✅ User logged in: ${email}`);

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email
      },
      token
    };
  }

  /**
   * Generate JWT token
   * 
   * Token structure:
   * {
   *   "userId": "abc123",
   *   "email": "user@example.com",
   *   "iat": 1704067200,    (issued at timestamp)
   *   "exp": 1704153600     (expiration timestamp)
   * }
   */
  static generateToken(userId: string, email: string): string {
    const payload: TokenPayload = {
      userId,
      email
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY // Token valid for 24 hours
    });

    return token;
  }

  /**
   * Verify JWT token
   * 
   * Returns decoded payload if valid
   * Throws error if invalid or expired
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Refresh token (optional)
   * For long-running sessions, allow users to get a new token
   */
  static refreshToken(token: string): string {
    const payload = this.verifyToken(token);
    return this.generateToken(payload.userId, payload.email);
  }
}
