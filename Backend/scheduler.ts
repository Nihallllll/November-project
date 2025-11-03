import { SchedulerService } from './services/scheduler.service';

/**
 * SCHEDULER PROCESS
 * 
 * Runs independently from server and worker.
 * Checks for scheduled flows every minute.
 * 
 * Start with: bun src/scheduler.ts
 */

async function main() {
  console.log('🚀 Starting Scheduler Process...\n');
  
  const scheduler = new SchedulerService();
  scheduler.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down scheduler...');
    scheduler.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down scheduler...');
    scheduler.stop();
    process.exit(0);
  });
  
  console.log('✅ Scheduler is running. Press Ctrl+C to stop.\n');
}

main().catch((error) => {
  console.error('❌ Scheduler failed to start:', error);
  process.exit(1);
});
