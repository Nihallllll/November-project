import { Router, type Request, type Response } from 'express';
import { HeliusService } from '../services/helius.services';

import { logger } from '../utils/logger';
import prisma from '../config/database';
import { enqueueFlowExecution } from '../queue/producer';
import { CredentialService } from '../services/credentail.service';

const router = Router();

/**
 * POST /api/v1/webhooks/helius/:flowId
 * 
 * Receives webhook events from Helius and triggers the associated flow.
 * This endpoint is called by Helius when monitored blockchain events occur.
 */
router.post('/webhooks/helius/:flowId', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { flowId } = req.params;
    const webhookPayload = req.body;
    const authHeader = req.headers.authorization;

    logger.info(`[Helius Webhook] Received webhook for flow: ${flowId}`);

    // ========== VALIDATE PAYLOAD ==========
    if (!webhookPayload || !Array.isArray(webhookPayload)) {
      logger.warn('[Helius Webhook] Invalid payload format - expected array');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook payload format. Expected array of events.',
      });
    }

    if (webhookPayload.length === 0) {
      logger.warn('[Helius Webhook] Empty payload received');
      return res.status(200).json({
        success: true,
        message: 'Empty payload received',
      });
    }

    // ========== FIND WEBHOOK IN DATABASE ==========
    const webhook = await HeliusService.getWebhookByFlowId(flowId!);

    if (!webhook) {
      logger.warn(`[Helius Webhook] No active webhook found for flow: ${flowId}`);
      return res.status(404).json({
        success: false,
        error: 'Webhook not found or inactive for this flow',
      });
    }

    // ========== VERIFY AUTH HEADER (Optional) ==========
    // If webhook was created with authHeader, verify it matches
    if (webhook.webhookType === 'enhanced' && authHeader) {
      // You can add custom auth verification logic here
      logger.info('[Helius Webhook] Auth header present');
    }

    logger.info(`[Helius Webhook] Processing ${webhookPayload.length} event(s)`);

    // ========== STORE WEBHOOK EVENTS ==========
    const storedEvents = [];
    for (const event of webhookPayload) {
      try {
        const storedEvent = await HeliusService.storeWebhookEvent(webhook.id, event);
        storedEvents.push(storedEvent);
        logger.info(`[Helius Webhook] Stored event: ${storedEvent.id} (${storedEvent.type})`);
      } catch (error: any) {
        logger.error(`[Helius Webhook] Failed to store event:`, error);
      }
    }

    // ========== TRIGGER FLOW EXECUTION ==========
    logger.info(`[Helius Webhook] Triggering flow execution for: ${webhook.flowId}`);

    const job = await enqueueFlowExecution(
      webhook.flowId,
      {
        trigger: 'helius_webhook',
        webhookId: webhook.id,
        heliusWebhookId: webhook.heliusWebhookId,
        events: webhookPayload,
        eventCount: webhookPayload.length,
        timestamp: new Date().toISOString(),
        // Include first event summary for easy access
        firstEvent: webhookPayload[0] ? {
          type: webhookPayload[0].type,
          signature: webhookPayload[0].signature,
          description: webhookPayload[0].description,
        } : null,
      },
      webhook.userId
    );

    logger.info(`[Helius Webhook] Flow execution queued: Job ID ${job.id}`);

    // ========== UPDATE WEBHOOK LAST TRIGGERED ==========
    await HeliusService.updateLastTriggered(webhook.id);

    // ========== MARK EVENTS AS PROCESSED ==========
    for (const storedEvent of storedEvents) {
      await HeliusService.markEventProcessed(storedEvent.id, undefined, undefined);
    }

    const processingTime = Date.now() - startTime;
    logger.info(`[Helius Webhook] Processing completed in ${processingTime}ms`);

    // ========== RESPOND TO HELIUS ==========
    // Helius expects a 200 response to confirm receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook received and flow triggered',
      data: {
        jobId: job.id,
        eventsProcessed: webhookPayload.length,
        processingTimeMs: processingTime,
      },
    });

  } catch (error: any) {
    logger.error('[Helius Webhook] Processing failed:', error);

    // Still return 200 to Helius to prevent retries
    // Log the error for debugging
    return res.status(200).json({
      success: false,
      error: error.message,
      message: 'Webhook received but processing failed',
    });
  }
});

/**
 * GET /api/v1/webhooks/helius/:flowId/events
 * 
 * Get webhook events for a specific flow (for debugging/monitoring)
 */
router.get('/webhooks/helius/:flowId/events', async (req: Request, res: Response) => {
  try {
    const { flowId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const webhook = await HeliusService.getWebhookByFlowId(flowId!);

    if (!webhook) {
      return res.status(404).json({
        success: false,
        error: 'Webhook not found for this flow',
      });
    }

    const events = await HeliusService.getWebhookEvents(webhook.id, limit);

    return res.status(200).json({
      success: true,
      data: {
        webhookId: webhook.id,
        heliusWebhookId: webhook.heliusWebhookId,
        events,
        total: events.length,
      },
    });
  } catch (error: any) {
    logger.error('[Helius Webhook] Failed to fetch events:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/webhooks/helius/user/:userId
 * 
 * Get all Helius webhooks for a user
 */
router.get('/webhooks/helius/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const webhooks = await HeliusService.getUserWebhooks(userId!);

    return res.status(200).json({
      success: true,
      data: webhooks,
      total: webhooks.length,
    });
  } catch (error: any) {
    logger.error('[Helius Webhook] Failed to fetch user webhooks:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/v1/webhooks/helius/:webhookId
 * 
 * Deactivate and delete a Helius webhook
 */
router.delete('/webhooks/helius/:webhookId', async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;

    // Get webhook from database
    const webhook = await prisma.heliusWebhook.findUnique({
      where: { id: webhookId },
      include: { user: true },
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        error: 'Webhook not found',
      });
    }

    // Get credential to access API key
    const credential = await CredentialService.getCredential(
      webhook.credentialId,
      webhook.userId
    );

    const decryptedData = CredentialService.decrypt(credential.data as string);
    const { apiKey } = decryptedData;

    // Delete webhook from Helius
    await HeliusService.deleteWebhook(apiKey, webhook.heliusWebhookId);

    // Deactivate in database
    await HeliusService.deactivateWebhook(webhookId!);

    logger.info(`[Helius Webhook] Webhook deleted: ${webhookId}`);

    return res.status(200).json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error: any) {
    logger.error('[Helius Webhook] Failed to delete webhook:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export const  heliusWebHookRoutes = router;
