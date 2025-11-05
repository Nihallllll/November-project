import crypto from 'crypto';
import prisma from '../config/database';

/**
 * Credential Service
 * 
 * Handles encryption/decryption of user credentials
 * Uses AES-256-GCM for encryption
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-byte-secret-key-here!!';
const ALGORITHM = 'aes-256-gcm';

// Return a Buffer of length 32 to be used with AES-256-GCM.
// Supports these input forms for ENCRYPTION_KEY:
//  - 64-char hex string (interpreted as raw 32 bytes)
//  - base64 string that decodes to 32 bytes
//  - any passphrase: we derive a 32-byte key using SHA-256
function getKeyBuffer(): Buffer {
  const raw = String(ENCRYPTION_KEY).trim();

  // hex (64 hex chars -> 32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }

  // base64 (decode and check length)
  if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
    try {
      const decoded = Buffer.from(raw, 'base64');
      if (decoded.length === 32) return decoded;
    } catch (e) {
      // fallthrough to derive
    }
  }

  // fallback: derive 32-byte key from passphrase
  return crypto.createHash('sha256').update(raw).digest();
}

export class CredentialService {
  
  /**
   * Encrypt credential data
   */
  static encrypt(data: any): string {
  // Use a 12-byte IV for AES-GCM (recommended) and a 32-byte key buffer
  const iv = crypto.randomBytes(12);
  const key = getKeyBuffer();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
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
    
  const key = getKeyBuffer();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
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
