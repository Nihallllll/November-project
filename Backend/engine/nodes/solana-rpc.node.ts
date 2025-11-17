// src/engine/nodes/solana-rpc.node.ts
import { Connection, PublicKey } from '@solana/web3.js';
import type { NodeHandler } from './node-handler.interface';
import { CredentialService } from '../../services/credentail.service';

export const solanaRPCNode: NodeHandler = {
  type: "solana_rpc",
  
  execute: async (nodeData, input, context): Promise<any> => {
    try {
      // Validate action
      if (!nodeData.action) {
        throw new Error('action is required');
      }

      // Get RPC URL from credential
      let rpcUrl: string;
      
      if (nodeData.credentialId && nodeData.userId) {
        context.logger('solana_rpc: fetching encrypted credential');
        
        // Fetch and decrypt credential using CredentialService
        const credential = await CredentialService.getCredential(
          nodeData.credentialId,
          nodeData.userId
        );

        if (credential.type !== 'solana_rpc') {
          throw new Error(`Invalid credential type: ${credential.type}. Expected: solana_rpc`);
        }

        // Decrypt credential data
        const credentialData = CredentialService.decrypt(credential.data as string);
        
        if (!credentialData.rpcUrl) {
          throw new Error('RPC URL not found in credential');
        }

        rpcUrl = credentialData.rpcUrl;
        context.logger(`solana_rpc: using RPC endpoint from credential`);
      } else if (nodeData.rpcUrl) {
        // Fallback: use rpcUrl directly from nodeData (for backward compatibility)
        rpcUrl = nodeData.rpcUrl;
        context.logger('solana_rpc: using RPC endpoint from node config');
      } else {
        throw new Error('RPC credential (with userId) or rpcUrl is required');
      }
      
      // Create connection
      const connection = new Connection(rpcUrl, 'confirmed');
      context.logger(`solana_rpc: executing action "${nodeData.action}"`);
      
      // Execute action
      let result;
      
      switch (nodeData.action) {
        case 'getBalance':
          if (!nodeData.address) throw new Error('address required for getBalance');
          const publicKey = new PublicKey(nodeData.address);
          const balance = await connection.getBalance(publicKey);
          result = { 
            address: nodeData.address,
            balance: balance / 1e9, // Convert lamports to SOL
            balanceLamports: balance,
          };
          context.logger(`solana_rpc: balance = ${result.balance} SOL`);
          break;
          
        case 'getAccountInfo':
          if (!nodeData.address) throw new Error('address required for getAccountInfo');
          const pubKey = new PublicKey(nodeData.address);
          const accountInfo = await connection.getAccountInfo(pubKey);
          
          if (!accountInfo) {
            result = {
              address: nodeData.address,
              exists: false,
            };
          } else {
            result = {
              address: nodeData.address,
              exists: true,
              owner: accountInfo.owner.toBase58(),
              lamports: accountInfo.lamports,
              solBalance: accountInfo.lamports / 1e9,
              executable: accountInfo.executable,
              rentEpoch: accountInfo.rentEpoch,
              dataLength: accountInfo.data.length,
            };
          }
          context.logger(`solana_rpc: account info retrieved for ${nodeData.address}`);
          break;
          
        case 'getTransaction':
          if (!nodeData.signature) throw new Error('signature required for getTransaction');
          const txResult = await connection.getTransaction(nodeData.signature);
          result = txResult;
          context.logger(`solana_rpc: transaction ${nodeData.signature} retrieved`);
          break;
          
        case 'getSignaturesForAddress':
          if (!nodeData.address) throw new Error('address required for getSignaturesForAddress');
          const pk = new PublicKey(nodeData.address);
          const signatures = await connection.getSignaturesForAddress(pk, {
            limit: nodeData.limit || 10
          });
          result = {
            address: nodeData.address,
            signatures,
            count: signatures.length,
          };
          context.logger(`solana_rpc: found ${signatures.length} signatures`);
          break;

        case 'getSlot':
          const slot = await connection.getSlot();
          result = { slot };
          context.logger(`solana_rpc: current slot = ${slot}`);
          break;

        case 'getBlockHeight':
          const blockHeight = await connection.getBlockHeight();
          result = { blockHeight };
          context.logger(`solana_rpc: block height = ${blockHeight}`);
          break;

        case 'getRecentBlockhash':
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          result = { blockhash, lastValidBlockHeight };
          context.logger(`solana_rpc: recent blockhash retrieved`);
          break;
          
        default:
          throw new Error(`Unknown action: ${nodeData.action}`);
      }
      
      return {
        success: true,
        action: nodeData.action,
        ...result,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      context.logger(`solana_rpc: error - ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};
