
import prisma from '../config/database';
import { CredentialService } from './credentail.service';
import { logger } from '../utils/logger';
import { createHelius } from 'helius-sdk';

export interface CreateHeliusWebhookParams {
  accountAddresses: string[];
  transactionTypes?: string[];
  webhookURL: string;
  webhookType?: string;
  authHeader?: string;
  txnStatus?: 'all' | 'success' | 'failed';
  encoding?: 'json' | 'jsonParsed';
}

export class HeliusService {
  /**
   * Create a Helius SDK instance
   */
  private static createClient(
    apiKey: string,
    network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'
  ) {
    return createHelius({ apiKey });
  }

  /**
   * Create a webhook on Helius
   */
  static async createWebhook(
    apiKey: string,
    params: CreateHeliusWebhookParams,
    network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'
  ) {
    logger.info(`[HeliusService] Creating webhook: ${params.webhookURL}`);

    try {
      const helius = this.createClient(apiKey, network);

      const webhook = await helius.webhooks.create({
        accountAddresses: params.accountAddresses,
        transactionTypes: params.transactionTypes || ['any'],
        webhookURL: params.webhookURL,
        webhookType: params.webhookType || 'enhanced',
        authHeader: params.authHeader,
        txnStatus: params.txnStatus,
        encoding: params.encoding,
      });

      logger.info(`[HeliusService] Webhook created: ${webhook.webhookID}`);
      return webhook;
    } catch (error: any) {
      logger.error('[HeliusService] Failed to create webhook:', error);
      throw new Error(`Failed to create Helius webhook: ${error.message}`);
    }
  }

  /**
   * Get all webhooks for an API key
   */
  static async getAllWebhooks(
    apiKey: string,
    network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'
  ) {
    try {
      const helius = this.createClient(apiKey, network);
      const webhooks = await helius.webhooks.getAll();
      logger.info(`[HeliusService] Retrieved ${webhooks.length} webhooks`);
      return webhooks;
    } catch (error: any) {
      logger.error('[HeliusService] Failed to fetch webhooks:', error);
      throw new Error(`Failed to fetch Helius webhooks: ${error.message}`);
    }
  }

  /**
   * Get a specific webhook by ID
   */
  static async getWebhookById(
    apiKey: string,
    webhookId: string,
    network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'
  ) {
    try {
      const helius = this.createClient(apiKey, network);
      return await helius.webhooks.get(webhookId);
    } catch (error: any) {
      logger.error(`[HeliusService] Failed to fetch webhook ${webhookId}:`, error);
      throw new Error(`Failed to fetch Helius webhook: ${error.message}`);
    }
  }

  /**
   * Update/Edit a webhook
   */
  static async updateWebhook(
    apiKey: string,
    webhookId: string,
    params: Partial<CreateHeliusWebhookParams>,
    network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'
  ) {
    logger.info(`[HeliusService] Updating webhook: ${webhookId}`);

    try {
      const helius = this.createClient(apiKey, network);

      const webhook = await helius.webhooks.update(webhookId, {
        accountAddresses: params.accountAddresses,
        transactionTypes: params.transactionTypes,
        webhookURL: params.webhookURL,
        webhookType: params.webhookType,
        authHeader: params.authHeader,
        txnStatus: params.txnStatus,
      });

      logger.info(`[HeliusService] Webhook updated: ${webhook.webhookID}`);
      return webhook;
    } catch (error: any) {
      logger.error('[HeliusService] Failed to update webhook:', error);
      throw new Error(`Failed to update Helius webhook: ${error.message}`);
    }
  }

  /**
   * Delete a webhook
   */
  static async deleteWebhook(
    apiKey: string,
    webhookId: string,
    network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'
  ): Promise<void> {
    logger.info(`[HeliusService] Deleting webhook: ${webhookId}`);

    try {
      const helius = this.createClient(apiKey, network);
      await helius.webhooks.delete(webhookId);
      logger.info(`[HeliusService] Webhook deleted: ${webhookId}`);
    } catch (error: any) {
      logger.error('[HeliusService] Failed to delete webhook:', error);
      throw new Error(`Failed to delete Helius webhook: ${error.message}`);
    }
  }

  /**
   * Register webhook in database
   */
  static async registerWebhookInDB(
    userId: string,
    flowId: string,
    heliusWebhook: any,
    credentialId: string
  ) {
    return await prisma.heliusWebhook.create({
      data: {
        userId,
        flowId,
        heliusWebhookId: heliusWebhook.webhookID,
        webhookURL: heliusWebhook.webhookURL,
        webhookType: heliusWebhook.webhookType,
        transactionTypes: heliusWebhook.transactionTypes,
        accountAddresses: heliusWebhook.accountAddresses,
        credentialId,
        isActive: true,
      },
    });
  }

  /**
   * Store incoming webhook event
   */
  static async storeWebhookEvent(webhookId: string, eventData: any) {
    // Extract transaction info from Helius payload
    const firstEvent = Array.isArray(eventData) ? eventData[0] : eventData;

    return await prisma.heliusWebhookEvent.create({
      data: {
        webhookId,
        signature: firstEvent?.signature || null,
        type: firstEvent?.type || 'UNKNOWN',
        timestamp: firstEvent?.timestamp
          ? new Date(firstEvent.timestamp * 1000) // Unix timestamp to Date
          : new Date(),
        eventData: eventData,
        processed: false,
      },
    });
  }

  /**
   * Mark event as processed
   */
  static async markEventProcessed(eventId: string, runId?: string, error?: string) {
    return await prisma.heliusWebhookEvent.update({
      where: { id: eventId },
      data: {
        processed: true,
        runId: runId || undefined,
        error: error || undefined,
      },
    });
  }

  /**
   * Deactivate webhook in database
   */
  static async deactivateWebhook(webhookId: string) {
    return await prisma.heliusWebhook.update({
      where: { id: webhookId },
      data: { isActive: false },
    });
  }

  /**
   * Update last triggered timestamp
   */
  static async updateLastTriggered(webhookId: string) {
    return await prisma.heliusWebhook.update({
      where: { id: webhookId },
      data: { lastTriggered: new Date() },
    });
  }

  /**
   * Get webhook from database by Helius webhook ID
   */
  static async getWebhookByHeliusId(heliusWebhookId: string) {
    return await prisma.heliusWebhook.findUnique({
      where: { heliusWebhookId },
      include: {
        flow: true,
        user: true,
      },
    });
  }

  /**
   * Get webhook from database by flow ID
   */
  static async getWebhookByFlowId(flowId: string) {
    return await prisma.heliusWebhook.findFirst({
      where: { flowId, isActive: true },
      include: {
        flow: true,
        user: true,
      },
    });
  }

  /**
   * Get all webhooks for a user
   */
  static async getUserWebhooks(userId: string) {
    return await prisma.heliusWebhook.findMany({
      where: { userId },
      include: {
        flow: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get webhook events
   */
  static async getWebhookEvents(webhookId: string, limit = 50) {
    return await prisma.heliusWebhookEvent.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
