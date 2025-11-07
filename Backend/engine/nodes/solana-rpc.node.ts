// src/engine/nodes/solana-rpc.node.ts
import { Connection, PublicKey } from '@solana/web3.js';
import type { NodeHandler } from './node-handler.interface';


export const solanaRPCNode: NodeHandler = {
  type: "solana_rpc",
  
  execute: async (config: any, context: any): Promise<any> => {
    try {
      // Validate
      if (!config.action) throw new Error('action is required');
      if (!config.rpcUrl) throw new Error('rpcUrl is required');
      
      // Create connection
      const connection = new Connection(config.rpcUrl, 'confirmed');
      
      // Execute action
      let result;
      
      switch (config.action) {
        case 'getBalance':
          if (!config.address) throw new Error('address required for getBalance');
          const publicKey = new PublicKey(config.address);
          const balance = await connection.getBalance(publicKey);
          result = { balance: balance / 1e9 }; // Convert lamports to SOL
          break;
          
        case 'getAccountInfo':
          if (!config.address) throw new Error('address required for getAccountInfo');
          const pubKey = new PublicKey(config.address);
          const accountInfo = await connection.getAccountInfo(pubKey);
          result = {
            owner: accountInfo?.owner.toBase58(),
            lamports: accountInfo?.lamports,
            executable: accountInfo?.executable,
          };
          break;
          
        case 'getTransaction':
          if (!config.signature) throw new Error('signature required for getTransaction');
          result = await connection.getTransaction(config.signature);
          break;
          
        case 'getSignaturesForAddress':
          if (!config.address) throw new Error('address required for getSignaturesForAddress');
          const pk = new PublicKey(config.address);
          result = await connection.getSignaturesForAddress(pk, {
            limit: config.limit || 10
          });
          break;
          
        default:
          throw new Error(`Unknown action: ${config.action}`);
      }
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};
