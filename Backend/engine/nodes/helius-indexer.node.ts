import type { NodeHandler } from './node-handler.interface';
import { HeliusService, type CreateHeliusWebhookParams } from '../../services/helius.services';
import { CredentialService } from '../../services/credentail.service';


/**
 * HELIUS INDEXER TRIGGER NODE
 * 
 * This is a TRIGGER node that sets up Helius webhooks to listen for
 * real-time Solana blockchain events and automatically trigger flows.
 * 
 * Configuration (nodeData):
 * - credentialId: string (required) - Helius API key credential
 * - webhookURL: string (required) - Your server's webhook endpoint
 * - accountAddresses: string[] (required) - Solana addresses to monitor
 * - transactionTypes: string[] (optional) - Transaction types to listen for
 * - webhookType: 'enhanced' | 'raw' | 'discord' (optional) - Default: 'enhanced'
 * - network: 'mainnet-beta' | 'devnet' (optional) - Default: 'mainnet-beta'
 * - authHeader: string (optional) - Custom auth header for verification
 * - userId: string (required) - User ID from context
 * - flowId: string (required) - Flow ID from context
 * 
 * Supported Transaction Types:
 * - ANY, NFT_LISTING, NFT_BID, NFT_SALE, NFT_MINT, NFT_AUCTION_CREATED,
 * - NFT_AUCTION_UPDATED, NFT_AUCTION_CANCELLED, NFT_CANCEL_LISTING,
 * - SWAP, TOKEN_MINT, TRANSFER, BURN, FREEZE_ACCOUNT, THAW_ACCOUNT,
 * - CREATE_STORE, WHITELIST_CREATOR, ADD_TO_WHITELIST, REMOVE_FROM_WHITELIST,
 * - AUCTION_MANAGER_CLAIM_BID, EMPTY_PAYMENT_ACCOUNT, UPDATE_PRIMARY_SALE_METADATA,
 * - ADD_TOKEN_TO_VAULT, ACTIVATE_VAULT, INIT_VAULT, SAFETY_DEPOSIT_BOX_V1,
 * - and many more...
 * 
 * Output:
 * {
 *   success: true,
 *   webhookId: string,
 *   heliusWebhookId: string,
 *   status: 'active',
 *   config: {...}
 * }
 */
export const heliusIndexerNode: NodeHandler = {
  type: 'helius_indexer',

  execute: async (nodeData, input, context) => {
    const {
      credentialId,
      accountAddresses,
      transactionTypes = ['ANY'],
      webhookType = 'enhanced',
      network = 'mainnet-beta',
      authHeader,
      userId,
      flowId,
    } = nodeData;

    context.logger('helius_indexer: Initializing webhook setup');

    // ========== VALIDATION ==========
    if (!credentialId) {
      throw new Error('credentialId is required');
    }

    if (!userId) {
      throw new Error('userId is required (should be provided by context)');
    }

    if (!flowId) {
      throw new Error('flowId is required (should be provided by context)');
    }

    if (!accountAddresses || !Array.isArray(accountAddresses) || accountAddresses.length === 0) {
      throw new Error('accountAddresses must be a non-empty array');
    }

    // ========== AUTO-GENERATE WEBHOOK URL ==========
    // Generate webhook URL based on your backend endpoint
    const baseUrl = process.env.WEBHOOK_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const webhookURL = `${baseUrl}/api/webhooks/helius/${flowId}`;
    
    context.logger(`helius_indexer: Auto-generated webhook URL: ${webhookURL}`);

    context.logger(`helius_indexer: Monitoring ${accountAddresses.length} address(es)`);

    try {
      // ========== FETCH & DECRYPT HELIUS API KEY ==========
      context.logger('helius_indexer: Fetching Helius API key credential');
      
      const credential = await CredentialService.getCredential(credentialId, userId);

      if (credential.type !== 'helius') {
        throw new Error(`Invalid credential type: expected 'helius', got '${credential.type}'`);
      }

      const decryptedData = CredentialService.decrypt(credential.data as string);
      const { apiKey } = decryptedData;

      if (!apiKey) {
        throw new Error('Invalid credential: missing apiKey field');
      }

      context.logger('helius_indexer: API key decrypted successfully');

      // ========== VALIDATE TRANSACTION TYPES ==========
      // Helius supports these transaction types as strings
      const validTransactionTypes = [
        'ANY', 'NFT_LISTING', 'NFT_BID', 'NFT_SALE', 'NFT_MINT', 'NFT_AUCTION_CREATED',
        'NFT_AUCTION_UPDATED', 'NFT_AUCTION_CANCELLED', 'NFT_CANCEL_LISTING',
        'SWAP', 'TOKEN_MINT', 'TRANSFER', 'BURN', 'FREEZE_ACCOUNT', 'THAW_ACCOUNT',
      ];

      const mappedTransactionTypes = transactionTypes.map((type: string) => {
        const upperType = type.toUpperCase();
        if (validTransactionTypes.includes(upperType)) {
          return upperType;
        }
        context.logger(`helius_indexer: Warning - Unknown transaction type: ${type}, defaulting to ANY`);
        return 'ANY';
      });

      context.logger(`helius_indexer: Transaction types: ${mappedTransactionTypes.join(', ')}`);

      // ========== VALIDATE WEBHOOK TYPE ==========
      const webhookTypeLower = (webhookType || 'enhanced').toLowerCase();
      let mappedWebhookType: 'enhanced' | 'raw' | 'discord' = 'enhanced';
      
      if (webhookTypeLower === 'raw') {
        mappedWebhookType = 'raw';
      } else if (webhookTypeLower === 'discord') {
        mappedWebhookType = 'discord';
      }

      context.logger(`helius_indexer: Webhook type: ${mappedWebhookType}`);

      // ========== CREATE HELIUS WEBHOOK ==========
      context.logger('helius_indexer: Creating webhook on Helius');

      const webhookParams: CreateHeliusWebhookParams = {
        webhookURL,
        accountAddresses,
        transactionTypes: mappedTransactionTypes,
        webhookType: mappedWebhookType,
        authHeader,
      };

      const heliusWebhook = await HeliusService.createWebhook(
        apiKey,
        webhookParams,
        network as 'mainnet-beta' | 'devnet'
      );

      context.logger(`helius_indexer: Webhook created with ID: ${heliusWebhook.webhookID}`);

      // ========== REGISTER WEBHOOK IN DATABASE ==========
      const dbWebhook = await HeliusService.registerWebhookInDB(
        userId,
        flowId,
        heliusWebhook,
        credentialId
      );

      context.logger(`helius_indexer: Webhook registered in database: ${dbWebhook.id}`);

      // ========== RETURN SUCCESS ==========
      return {
        success: true,
        webhookId: dbWebhook.id,
        heliusWebhookId: heliusWebhook.webhookID,
        status: 'active',
        config: {
          webhookURL: heliusWebhook.webhookURL,
          transactionTypes: heliusWebhook.transactionTypes,
          accountAddresses: heliusWebhook.accountAddresses,
          webhookType: heliusWebhook.webhookType,
          network,
        },
        message: `Helius indexer successfully configured for ${accountAddresses.length} address(es)`,
        monitoredAddresses: accountAddresses,
        listenFor: transactionTypes,
      };
    } catch (error: any) {
      context.logger(`helius_indexer: Error - ${error.message}`);
      throw new Error(`Helius indexer setup failed: ${error.message}`);
    }
  },
};
