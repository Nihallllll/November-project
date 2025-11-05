
import * as cron from 'node-cron';

import prisma from '../config/database';
import { enqueueFlowExecution } from '../queue/producer';

/**
 * SCHEDULER SERVICE
 * 
 * Background service that checks for scheduled flows and triggers them.
 * 
 * How it works:
 * 1. Runs every 1 minute (cron: * * * * *)
 * 2. Fetches all active flows with schedules
 * 3. For each flow:
 *    - Parse schedule (cron or interval)
 *    - Check if it should run now
 *    - If yes, enqueue job to Redis
 *    - Update lastRunAt and nextRunAt
 * 
 * Schedule Types:
 * - Cron: "*5 * * * *" (every 5 minutes)
 * - Interval: "5m" (every 5 minutes), "1h" (every hour), "30s" (every 30 seconds)
 */

export class SchedulerService {
  private task: cron.ScheduledTask | null = null;
  
  /**
   * Start the scheduler
   * Runs check every 1 minute
   */
  start() {
    console.log('📅 Scheduler starting...');
    
    // Run every minute: * * * * *
    // Minute Hour DayOfMonth Month DayOfWeek
    this.task = cron.schedule('* * * * *', async () => {
      await this.checkScheduledFlows();
    });
    
    console.log('✅ Scheduler started - checking every minute');
  }
  
  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('🛑 Scheduler stopped');
    }
  }
  
  /**
   * Main logic: Check all scheduled flows
   */
  private async checkScheduledFlows() {
    try {
      const now = new Date();
      console.log(`\n⏰ [${now.toISOString()}] Checking scheduled flows...`);
      
      // ========== STEP 1: FETCH SCHEDULED FLOWS ==========
      
      // Get all active flows that have a schedule
      const scheduledFlows = await prisma.flow.findMany({
        where: {
          status: 'ACTIVE',
          schedule: {
            not: null  // Only flows with a schedule
          }
        }
      });
      
      console.log(`   📋 Found ${scheduledFlows.length} scheduled flows`);
      
      if (scheduledFlows.length === 0) {
        return;
      }
      
      // ========== STEP 2: CHECK EACH FLOW ==========
      
      for (const flow of scheduledFlows) {
        try {
          const shouldRun = this.shouldRunNow(flow.schedule!, flow.lastRunAt, now);
          
          if (shouldRun) {
            console.log(`   🚀 Triggering flow: ${flow.name} (${flow.id})`);
            
            // ========== STEP 3: CREATE RUN & ENQUEUE JOB ==========
            
            // Create run record first
            const run = await prisma.run.create({
              data: {
                flowId: flow.id,
                userId : flow.userId,
                status: 'QUEUED',
                input: {}  // Scheduled flows have no input
              }
            });
            
            // Enqueue the job with the run ID
            await enqueueFlowExecution(run.id,{},flow.userId);
            
            // ========== STEP 4: UPDATE TIMESTAMPS ==========
            
            const nextRun = this.calculateNextRun(flow.schedule!, now);
            
            await prisma.flow.update({
              where: { id: flow.id },
              data: {
                lastRunAt: now,
                nextRunAt: nextRun
              }
            });
            
            console.log(`   ✅ Enqueued! Next run: ${nextRun?.toISOString() || 'N/A'}`);
          }
          
        } catch (error: any) {
          console.error(`   ❌ Error processing flow ${flow.id}:`, error.message);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Scheduler error:', error.message);
    }
  }
  
  /**
   * Check if flow should run now
   * 
   * @param schedule - Cron expression or interval (e.g., "*5 * * * *" or "5m")
   * @param lastRunAt - When flow last ran
   * @param now - Current time
   */
  private shouldRunNow(schedule: string, lastRunAt: Date | null, now: Date): boolean {
    // ========== INTERVAL FORMAT (5m, 1h, 30s) ==========
    
    if (this.isIntervalFormat(schedule)) {
      const intervalMs = this.parseInterval(schedule);
      
      // If never run before, run it now
      if (!lastRunAt) {
        return true;
      }
      
      // Check if enough time has passed
      const timeSinceLastRun = now.getTime() - lastRunAt.getTime();
      return timeSinceLastRun >= intervalMs;
    }
    
    // ========== CRON FORMAT (*/5 * * * *) ==========
    
    // Use node-cron to validate if current time matches cron expression
    return cron.validate(schedule) && this.matchesCron(schedule, now);
  }
  
  /**
   * Check if schedule is interval format (5m, 1h, etc.)
   */
  private isIntervalFormat(schedule: string): boolean {
    return /^\d+[smh]$/.test(schedule);
    // Matches: 5m, 30s, 1h, 10m, etc.
  }
  
  /**
   * Parse interval to milliseconds
   * Examples: "5m" → 300000, "1h" → 3600000
   */
  private parseInterval(interval: string): number {
    const value = parseInt(interval.slice(0, -1));
    const unit = interval.slice(-1);
    
    const multipliers: Record<string, number> = {
      's': 1000,           // seconds
      'm': 60 * 1000,      // minutes
      'h': 60 * 60 * 1000  // hours
    };
    
    return value * multipliers[unit]!;
  }
  
  /**
   * Check if current time matches cron expression
   * Simplified: checks if we're in the right minute
   */
  private matchesCron(cronExpression: string, now: Date): boolean {
    // For simplicity, we check minute-level granularity
    // A full implementation would parse the cron expression properly
    
    // This is a simplified version - in production use a library like 'cron-parser'
    const parts = cronExpression.split(' ');
    const minute = parts[0];
    
    if (minute === '*') {
      return true; // Every minute
    }
    
    if (minute!.startsWith('*/')) {
      // Every N minutes (e.g., */5)
      const interval = parseInt(minute!.slice(2));
      return now.getMinutes() % interval === 0;
    }
    
    // Specific minute
    return parseInt(minute!) === now.getMinutes();
  }
  
  /**
   * Calculate next run time based on schedule
   */
  private calculateNextRun(schedule: string, now: Date): Date | null {
    if (this.isIntervalFormat(schedule)) {
      const intervalMs = this.parseInterval(schedule);
      return new Date(now.getTime() + intervalMs);
    }
    
    // For cron, we'd need a proper parser to calculate next occurrence
    // For now, return null (could use 'cron-parser' library)
    return null;
  }
}
 