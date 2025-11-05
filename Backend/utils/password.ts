import bcrypt from 'bcrypt';

/**
 * Password Hashing & Verification
 * Uses bcrypt for secure password storage
 */

export class PasswordUtil {
  /**
   * Hash a plaintext password
   * 
   * How it works:
   * 1. Generate a random "salt" (randomness added to password)
   * 2. Combine password + salt
   * 3. Hash 10 times (rounds=10)
   * 4. Return the hash (unhashable!)
   * 
   * Example:
   * password = "secure123"
   * hash = "$2b$10$abcdef..." (impossible to reverse!)
   */
  static async hash(password: string): Promise<string> {
    // Rounds = 10 means it takes ~100ms to hash (makes brute force slow)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  /**
   * Verify a plaintext password against a hash
   * 
   * How it works:
   * 1. Hash the plaintext password
   * 2. Compare byte-by-byte with stored hash
   * 3. Return true if matches, false if not
   */
  static async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    return isValid;
  }
}
