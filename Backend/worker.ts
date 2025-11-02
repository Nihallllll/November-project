import { Worker } from 'bullmq';
import redis from './config/redis';
import { executeFlow } from './engine/executor';

console.log('🔥 Worker starting...');

const worker = new Worker(
    'flow-execution',  // Must match queue name
    async (job) => {
        const { flowId, input } = job.data;
        
        console.log(`\n📨 Received job: Execute flow ${flowId}`);
        console.log(`Job ID: ${job.id}`);
        
        try {
            // The runId should be in job data
            // We'll need to update producer to include it
            const runId = job.data.runId;
            
            if (!runId) {
                throw new Error('Run ID not found in job data');
            }
            
            await executeFlow(runId);
            
            console.log(`✅ Job completed: ${job.id}\n`);
        } catch (error: any) {
            console.error(`❌ Job failed: ${job.id}`, error.message);
            throw error;  // Will mark job as failed
        }
    },
    {
        connection: redis
    }
);

worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log('👀 Worker ready, waiting for jobs...\n');
