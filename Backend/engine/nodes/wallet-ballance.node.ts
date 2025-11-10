import type { NodeHandler } from "./node-handler.interface";
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

/**
 * WALLET BALANCE NODE
 * 
 * Checks SOL balance of a Solana wallet address on mainnet or devnet.
 * 
 * Configuration (nodeData):
 * - walletAddress: string (required) - The Solana wallet address
 * - network: 'mainnet-beta' | 'devnet' | 'testnet' (optional) - defaults to 'mainnet-beta'
 * - customRpcUrl: string (optional) - Use custom RPC endpoint instead of public
 * 
 * Output:
 * {
 *   walletAddress: string,
 *   balance: number,        // Balance in SOL
 *   lamports: number,       // Raw balance in lamports
 *   timestamp: Date,
 *   network: string,
 *   rpcEndpoint: string
 * }
 * 
 * Example usage:
 * {
 *   "type": "wallet_balance",
 *   "data": {
 *     "walletAddress": "yTQ83UxRVa95DSizfTRj6CibSLFw6nP4hwctpS485iH",
 *     "network": "mainnet-beta"
 *   }
 * }
 */

export const walletBalanceNode: NodeHandler = {
  type: "wallet_balance",
  
  execute: async (nodeData, input, context) => {
    // ========== STEP 1: VALIDATE & EXTRACT CONFIGURATION ==========
    
    const { 
      walletAddress, 
      network = 'mainnet-beta',
      customRpcUrl 
    } = nodeData;
    
    // Validate wallet address
    if (!walletAddress) {
      throw new Error("wallet_balance: walletAddress is required");
    }
    
    context.logger(`wallet_balance: checking balance for ${walletAddress}`);
    context.logger(`wallet_balance: network = ${network}`);
    
    try {
      // ========== STEP 2: CREATE PUBLIC KEY ==========
      
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch (error) {
        throw new Error(`wallet_balance: Invalid wallet address format: ${walletAddress}`);
      }
      
      // ========== STEP 3: DETERMINE RPC ENDPOINT ==========
      
      let rpcEndpoint: string;
      
      if (customRpcUrl) {
        // Use custom RPC if provided
        rpcEndpoint = customRpcUrl;
        context.logger(`wallet_balance: using custom RPC: ${rpcEndpoint}`);
      } else {
        // Use public cluster API based on network selection
        switch (network) {
          case 'mainnet-beta':
            rpcEndpoint = clusterApiUrl('mainnet-beta');
            break;
          case 'devnet':
            rpcEndpoint = clusterApiUrl('devnet');
            break;
          case 'testnet':
            rpcEndpoint = clusterApiUrl('testnet');
            break;
          default:
            rpcEndpoint = clusterApiUrl('mainnet-beta');
        }
        context.logger(`wallet_balance: using ${network} RPC: ${rpcEndpoint}`);
      }
      
      // ========== STEP 4: CREATE CONNECTION ==========
      
      const connection = new Connection(rpcEndpoint, 'confirmed');
      
      // ========== STEP 5: GET BALANCE FROM BLOCKCHAIN ==========
      
      context.logger(`wallet_balance: querying blockchain...`);
      
      // getBalance returns balance in lamports (smallest unit)
      // 1 SOL = 1,000,000,000 lamports
      const lamports = await connection.getBalance(publicKey);
      
      // Convert lamports to SOL (divide by 1 billion)
      const balanceInSOL = lamports / 1_000_000_000;
      
      // ========== STEP 6: FORMAT AND RETURN RESULT ==========
      
      const result = {
        walletAddress: walletAddress,
        balance: balanceInSOL,           // Human-readable SOL amount
        lamports: lamports,               // Raw lamports (for precision)
        timestamp: new Date(),
        network: network,
        rpcEndpoint: rpcEndpoint
      };
      
      context.logger(`wallet_balance: ${balanceInSOL} SOL (${lamports} lamports)`);
      
      return result;
      
    } catch (error: any) {
      // ========== STEP 7: ERROR HANDLING ==========
      
      context.logger(`wallet_balance: error - ${error.message}`);
      
      return {
        walletAddress: walletAddress,
        balance: 0,
        lamports: 0,
        error: error.message,
        timestamp: new Date(),
        network: network
      };
    }
  }
};
