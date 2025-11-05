// queue/worker.ts - CORRECTED

import { Worker } from 'bullmq';
import redis from './config/redis';
import prisma from './config/database';
import { executeFlow } from './engine/executor';
import { RunRepositories } from './repositories/run.repositories';
import { AppLogger } from './utils/logger';

AppLogger.info('🔥 Worker initializing...');

const worker = new Worker(
  'flow-execution',
  async (job) => {
    const { runId, userId, input } = job.data;
    
    AppLogger.info(`📨 Received job: Execute flow run ${runId}`, {
      jobId: job.id,
      userId,
      attempt: job.attemptsMade + 1
    });

    try {
      // Validate runId exists
      if (!runId) {
        throw new Error('❌ Run ID not provided in job data');
      }

      // Validate userId exists
      if (!userId) {
        throw new Error('❌ User ID not provided in job data');
      }

      // 1. Update run status to RUNNING
      await RunRepositories.updateStatus(runId, 'RUNNING');
      AppLogger.info(`⏳ Run status updated to RUNNING`, { runId });

      // 2. Execute the flow
      const result = await executeFlow(runId, userId);
      AppLogger.info(`✅ Flow execution completed`, { 
        runId, 
        resultCount: result.results?.length || 0 
      });

      // 3. Mark as completed
      await RunRepositories.updateStatus(runId, 'COMPLETED', result);
      AppLogger.info(`✅ Job completed successfully`, { 
        jobId: job.id,
        runId 
      });

      return {
        success: true,
        runId,
        result,
        completedAt: new Date().toISOString()
      };

    } catch (error: any) {
      AppLogger.error(`❌ Job failed: ${job.id}`, error);

      try {
        // Try to update run status as FAILED
        await RunRepositories.updateStatus(
          runId,
          'FAILED',
          null,
          error.message
        );
        AppLogger.info(`📝 Run status updated to FAILED`, { 
          runId, 
          error: error.message 
        });
      } catch (dbError: any) {
        AppLogger.error('Failed to update run status in DB', dbError);
      }

      // Re-throw so BullMQ marks job as failed
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
    maxStalledCount: 2,
    stalledInterval: 5000,
    lockDuration: 30000,    // 30 seconds
    lockRenewTime: 15000    // Renew lock every 15 seconds
  }
);

/**
 * Job completion handler
 */
worker.on('completed', (job) => {
  AppLogger.info(`✅ Job completed successfully`, {
    jobId: job.id,
    duration: job.finishedOn ? job.finishedOn - job.processedOn! : 'unknown'
  });
});

/**
 * Job failure handler
 */
worker.on('failed', (job, err) => {
  AppLogger.error(`❌ Job failed`, {
    jobId: job?.id,
    attempt: job?.attemptsMade || 0,
    totalAttempts: job?.opts?.attempts,
    error: err.message,
    runId: job?.data?.runId
  });

  // Alert if too many failures
  if (job && job.attemptsMade >= (job.opts?.attempts || 3)) {
    AppLogger.error(`🚨 CRITICAL: Job ${job.id} exhausted all retries!`, {
      jobId: job.id,
      runId: job.data?.runId,
      totalAttempts: job.opts?.attempts
    });
  }
});

/**
 * Job stalled handler (job took too long)
 */
worker.on('stalled', (jobId) => {
  AppLogger.warn(`⚠️ Job stalled (may be retried)`, { jobId });
});

/**
 * Worker ready
 */
worker.on('ready', () => {
  AppLogger.info('👀 Worker ready and listening for jobs...', {
    concurrency: worker.opts.concurrency,
    maxStalledCount: worker.opts.maxStalledCount
  });
});

/**
 * Worker error
 */
worker.on('error', (err) => {
  AppLogger.error('❌ Worker encountered an error', err);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  AppLogger.info('🛑 SIGTERM received, shutting down worker gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  AppLogger.info('🛑 SIGINT received, shutting down worker gracefully...');
  await worker.close();
  process.exit(0);
});

AppLogger.info('✨ Worker is ready!');

export default worker;
