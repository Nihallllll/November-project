import type { NodeHandler } from "./node-handler.interface";
import { PublicKey } from '@solana/web3.js';

/**
 * WALLET BALANCE NODE
 * 
 * What it does:
 * - Checks SOL balance of a Solana wallet
 * - Converts lamports to SOL (1 SOL = 1 billion lamports)
 * - Returns balance and wallet address
 * 
 * Configuration (nodeData):
 * - walletAddress: string (required) - The Solana wallet address
 * - network: 'mainnet-beta' | 'devnet' (optional) - defaults to devnet
 * 
 * Input:
 * - Any data from previous node (ignored, but can be logged)
 * 
 * Output:
 * {
 *   walletAddress: string,
 *   balance: number,        // Balance in SOL
 *   lamports: number,       // Raw balance in lamports
 *   timestamp: Date,
 *   network: string
 * }
 * 
 * Example usage in flow:
 * {
 *   "type": "wallet_balance",
 *   "data": {
 *     "walletAddress": "Fg8K7cMNpNy5K4J6J7H8F9H8G7F6D5C4B3A2Z1Y0X9"
 *   }
 * }
 */

export const walletBalanceNode: NodeHandler = {
  type: "wallet_balance",
  
  execute: async (nodeData, input, context) => {
    // ========== STEP 1: VALIDATE INPUT ==========
    
    const { walletAddress, network = 'devnet' } = nodeData;
    
    // Check if wallet address provided
    if (!walletAddress) {
      throw new Error("wallet_balance: walletAddress is required");
    }
    
    context.logger(`wallet_balance: checking balance for ${walletAddress}`);
    
    // ========== STEP 2: CHECK WEB3 CONNECTION ==========
    
    if (!context.web3?.solana) {
      throw new Error("wallet_balance: Solana connection not available");
    }
    
    try {
      // ========== STEP 3: CREATE PUBLIC KEY ==========    
      
      // Convert string address to PublicKey object
      // This validates the address format
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch (error) {
        throw new Error(`wallet_balance: Invalid wallet address format: ${walletAddress}`);
      }
      
      // ========== STEP 4: GET BALANCE FROM BLOCKCHAIN ==========
      
      context.logger(`wallet_balance: querying blockchain...`);
      
      // getBalance returns balance in lamports (smallest unit)
      // 1 SOL = 1,000,000,000 lamports
      const lamports = await context.web3.solana.getBalance(publicKey);
      
      // Convert lamports to SOL (divide by 1 billion)
      const balanceInSOL = lamports / 1_000_000_000;
      
      // ========== STEP 5: FORMAT AND RETURN RESULT ==========
      
      const result = {
        walletAddress: walletAddress,
        balance: balanceInSOL,           // Human-readable SOL amount
        lamports: lamports,               // Raw lamports (for precision)
        timestamp: new Date(),
        network: network
      };
      
      context.logger(`wallet_balance: ${balanceInSOL} SOL (${lamports} lamports)`);
      
      return result;
      
    } catch (error: any) {
      // ========== STEP 6: ERROR HANDLING ==========
      
      context.logger(`wallet_balance: error - ${error.message}`);
      
      return {
        walletAddress: walletAddress,
        balance: 0,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
};
