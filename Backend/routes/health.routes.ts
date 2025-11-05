import { Router } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import { logger } from '../utils/logger';


const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const checks = {
      server: 'ok',
      database: 'checking...',
      redis: 'checking...',
      timestamp: new Date().toISOString()
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch (e) {
      checks.database = 'error';
    }

    // Check redis
    try {
      await redis.ping();
      checks.redis = 'ok';
    } catch (e) {
      checks.redis = 'error';
    }

    const allOk = checks.database === 'ok' && checks.redis === 'ok';

    res.status(allOk ? 200 : 503).json({
      success: allOk,
      checks: checks
    });
  } catch (error: any) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * System stats
 */
router.get('/stats', async (req, res) => {
  try {
    const [flowCount, runCount, credentialCount] = await Promise.all([
      prisma.flow.count(),
      prisma.run.count(),
      prisma.credential.count()
    ]);

    res.json({
      success: true,
      stats: {
        totalFlows: flowCount,
        totalRuns: runCount,
        totalCredentials: credentialCount,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
