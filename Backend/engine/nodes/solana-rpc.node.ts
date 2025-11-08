// src/engine/nodes/solana-rpc.node.ts
import { Connection, PublicKey } from '@solana/web3.js';
import type { NodeHandler } from './node-handler.interface';


export const solanaRPCNode: NodeHandler = {
  type: "solana_rpc",
  
  execute: async (nodeData ,input, context): Promise<any> => {
    try {
      // Validate
      if (!nodeData.action) throw new Error('action is required');
      if (!nodeData.rpcUrl) throw new Error('rpcUrl is required');
      
      // Create connection
      const connection = new Connection(nodeData.rpcUrl, 'confirmed');
      
      // Execute action
      let result;
      
      switch (nodeData.action) {
        case 'getBalance':
          if (!nodeData.address) throw new Error('address required for getBalance');
          const publicKey = new PublicKey(nodeData.address);
          const balance = await connection.getBalance(publicKey);
          result = { balance: balance / 1e9 }; // Convert lamports to SOL
          break;
          
        case 'getAccountInfo':
          if (!nodeData.address) throw new Error('address required for getAccountInfo');
          const pubKey = new PublicKey(nodeData.address);
          const accountInfo = await connection.getAccountInfo(pubKey);
          result = {
            owner: accountInfo?.owner.toBase58(),
            lamports: accountInfo?.lamports,
            executable: accountInfo?.executable,
          };
          break;
          
        case 'getTransaction':
          if (!nodeData.signature) throw new Error('signature required for getTransaction');
          result = await connection.getTransaction(nodeData.signature);
          break;
          
        case 'getSignaturesForAddress':
          if (!nodeData.address) throw new Error('address required for getSignaturesForAddress');
          const pk = new PublicKey(nodeData.address);
          result = await connection.getSignaturesForAddress(pk, {
            limit: nodeData.limit || 10
          });
          break;
          
        default:
          throw new Error(`Unknown action: ${nodeData.action}`);
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
