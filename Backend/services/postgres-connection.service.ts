import { Pool } from 'pg';

import { EncryptionUtil } from '../utils/encryption.util';
import prisma from '../config/database';


export class PostgresConnectionService {
  private static pools: Map<string, Pool> = new Map();

  static async getPool(credentialId: string): Promise<Pool> {
    // Check if pool already exists
    if (this.pools.has(credentialId)) {
      return this.pools.get(credentialId)!;
    }

    // Fetch credential from DB
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      throw new Error(`Credential ${credentialId} not found`);
    }

    if (credential.type !== 'postgres_db') {
      throw new Error(`Credential ${credentialId} is not a postgres_db credential`);
    }

    // Decrypt connection URL
    const decryptedData = JSON.parse(EncryptionUtil.decrypt(credential.data as string));
    const connectionUrl = decryptedData.connectionUrl;

    // Create pool
    const pool = new Pool({
      connectionString: connectionUrl,
      max: 10,  // max connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection
    try {
      const client = await pool.connect();
      client.release();
      console.log(`✅ Postgres pool created for credential: ${credentialId}`);
    } catch (error : any) {
      await pool.end();
      throw new Error(`Failed to connect to Postgres: ${error.message}`);
    }

    // Store pool
    this.pools.set(credentialId, pool);
    return pool;
  }

  static async closePool(credentialId: string): Promise<void> {
    const pool = this.pools.get(credentialId);
    if (pool) {
      await pool.end();
      this.pools.delete(credentialId);
      console.log(`🔴 Postgres pool closed for credential: ${credentialId}`);
    }
  }

  static async closeAllPools(): Promise<void> {
    const promises = Array.from(this.pools.keys()).map((id) => this.closePool(id));
    await Promise.all(promises);
    console.log('🔴 All Postgres pools closed');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await PostgresConnectionService.closeAllPools();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await PostgresConnectionService.closeAllPools();
  process.exit(0);
});
