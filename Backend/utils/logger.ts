// utils/logger.ts - Enhanced version

import pino from 'pino';
import prisma from '../config/database';

/**
 * Centralized logging system
 * Use for all application logs
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false
    }
  }
});

/**
 * Execution Logger - Logs execution details to both console & database
 */
export class ExecutionLogger {
  private executionId: string;
  private nodeId: string;
  private runId: string;

  constructor(runId: string, executionId: string, nodeId: string) {
    this.runId = runId;
    this.executionId = executionId;
    this.nodeId = nodeId;
  }

  async log(message: string, data?: any) {
    const logData = {
      executionId: this.executionId,
      nodeId: this.nodeId,
      level: 'info',
      ...data
    };
    
    logger.info(logData, message);
    
    // Save to database
    await this.saveToDB('INFO', message, data);
  }

  async error(message: string, error?: any) {
    const logData = {
      executionId: this.executionId,
      nodeId: this.nodeId,
      error: error?.message || error,
      stack: error?.stack,
      level: 'error'
    };
    
    logger.error(logData, message);
    
    // Save to database
    await this.saveToDB('ERROR', message, error);
  }

  async warn(message: string, data?: any) {
    const logData = {
      executionId: this.executionId,
      nodeId: this.nodeId,
      level: 'warn',
      ...data
    };
    
    logger.warn(logData, message);
    
    // Save to database
    await this.saveToDB('WARN', message, data);
  }

  async debug(message: string, data?: any) {
    const logData = {
      executionId: this.executionId,
      nodeId: this.nodeId,
      level: 'debug',
      ...data
    };
    
    logger.debug(logData, message);
    
    // Save to database (only if DEBUG level enabled)
    if (process.env.LOG_LEVEL === 'debug') {
      await this.saveToDB('DEBUG', message, data);
    }
  }

  private async saveToDB(level: string, message: string, data?: any) {
    try {
      // Only save if we have a runId
      if (!this.runId) return;

      await prisma.executionLog.create({
        data: {
          runId: this.runId,
          nodeId: this.nodeId,
          level,
          message,
          metadata: data ? JSON.stringify(data) : null,
          timestamp: new Date()
        }
      });
    } catch (err: any) {
      // Fallback to console if database save fails
      console.error('Failed to save log to database:', err.message);
    }
  }
}

/**
 * Global application logger
 */
export class AppLogger {
  static info(message: string, data?: any) {
    logger.info(data || {}, message);
  }

  static error(message: string, error?: any) {
    logger.error(error || {}, message);
  }

  static warn(message: string, data?: any) {
    logger.warn(data || {}, message);
  }

  static debug(message: string, data?: any) {
    logger.debug(data || {}, message);
  }
}
