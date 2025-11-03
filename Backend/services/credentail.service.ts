import crypto from 'crypto';
import prisma from '../config/database';

/**
 * Credential Service
 * 
 * Handles encryption/decryption of user credentials
 * Uses AES-256-GCM for encryption
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-byte-secret-key-here!!'; // Must be 32 bytes
const ALGORITHM = 'aes-256-gcm';

export class CredentialService {
  
  /**
   * Encrypt credential data
   */
  static encrypt(data: any): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  /**
   * Decrypt credential data
   */
  static decrypt(encryptedString: string): any {
    const parts = encryptedString.split(':');
    
    // ✅ FIX 1: Add type assertion for parts array access
    const iv = Buffer.from(parts[0]!, 'hex');        // ← Add ! to tell TypeScript it exists
    const authTag = Buffer.from(parts[1]!, 'hex');   // ← Add ! 
    const encrypted = parts[2]!;                     // ← Add !
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  /**
   * Get credential by ID (checks ownership)
   */
  static async getCredential(credentialId: string, userId: string) {
    // ✅ FIX 2: Add type annotation
    const credential = await prisma.credential.findFirst({
      where: {
        id: credentialId,
        userId: userId,
        isActive: true
      }
    });
    
    if (!credential) {
      throw new Error('Credential not found or access denied');
    }
    
    return credential;
  }
  
  /**
   * Create new credential
   */
  static async createCredential(userId: string, name: string, type: string, data: any) {
    const encryptedData = this.encrypt(data);
    
    return await prisma.credential.create({
      data: {
        userId,
        name,
        type,
        data: encryptedData as any  // ✅ This is correct - Prisma needs Json type
      }
    });
  }
}
