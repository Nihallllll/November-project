import Redis from 'ioredis';

/**
 * Redis Configuration for BullMQ
 * 
 * IMPORTANT: BullMQ requires maxRetriesPerRequest to be null
 * This is because BullMQ uses blocking Redis commands (BRPOPLPUSH)
 * which need unlimited retry attempts.
 */

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,  // ← CRITICAL: Required for BullMQ
});

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

export default redis;
