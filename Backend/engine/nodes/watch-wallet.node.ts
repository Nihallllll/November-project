import type { NodeHandler } from './node-handler.interface';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { getConnection } from '../../config/web3';
import prisma from '../../config/database';


/**
 * Watch Wallet Node
 * 
 * Monitors Solana wallets for changes (balance, tokens, transactions)
 * and triggers flows when conditions are met.
 * 
 * This is a POLLING approach - it checks blockchain state on each execution.
 * The scheduler determines how often to check (e.g., every 1 minute).
 */
export const watchWalletNode: NodeHandler = {
  type: "watch-wallet",
  
  execute: async (nodeData: any, input: any, context: any): Promise<any> => {
    // ========================================
    // STEP 1: EXTRACT & VALIDATE CONFIGURATION
    // ========================================
    
    const {
      walletAddress,
      watchType,
      condition,
      tokenMint,
      triggerOnFirstCheck = false
    } = nodeData;

    // Validate required fields
    if (!walletAddress) {
      throw new Error('walletAddress is required');
    }

    if (!watchType || !['balance', 'token_balance', 'transaction'].includes(watchType)) {
      throw new Error('watchType must be: balance, token_balance, or transaction');
    }

    if (!condition || !condition.operator || condition.value === undefined) {
      throw new Error('condition with operator and value is required');
    }

    // Validate Solana wallet address format
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(walletAddress);
    } catch (error) {
      throw new Error(`Invalid wallet address format: ${walletAddress}`);
    }

    // Validate token mint for token_balance type
    if (watchType === 'token_balance') {
      if (!tokenMint) {
        throw new Error('tokenMint is required for token_balance watch type');
      }
      
      try {
        new PublicKey(tokenMint);
      } catch (error) {
        throw new Error(`Invalid token mint address: ${tokenMint}`);
      }
    }

    context.logger(`watch-wallet: monitoring ${walletAddress} for ${watchType}`);

    // ========================================
    // STEP 2: FETCH PREVIOUS STATE FROM DATABASE
    // ========================================
    
    // Create unique identifier for this watch
    const watchKey = {
      flowId: context.flowId,
      nodeId: context.nodeId || 'default', // Fallback if nodeId not provided
      walletAddress: walletAddress
    };

    // Query database for previous state
    const previousWatch = await prisma.walletWatch.findUnique({
      where: {
        flowId_nodeId_walletAddress: watchKey
      }
    });

    const isFirstCheck = !previousWatch;
    context.logger(`watch-wallet: first check: ${isFirstCheck}`);

    // ========================================
    // STEP 3: FETCH CURRENT STATE FROM SOLANA
    // ========================================
    
    const connection = getConnection();
    
    // Initialize with default values to prevent TypeScript errors
    let currentValue: number = 0;
    let previousValue: number = 0;
    let conditionMet: boolean = false;
    let additionalData: any = {};

    if (watchType === 'balance') {
      // ----------------
      // BALANCE WATCH
      // ----------------
      
      // Fetch current balance from blockchain
      currentValue = await connection.getBalance(publicKey);
      previousValue = previousWatch?.lastBalance ? Number(previousWatch.lastBalance) : 0;

      context.logger(`watch-wallet: balance check - current: ${currentValue} lamports, previous: ${previousValue} lamports`);

      // Evaluate condition
      conditionMet = evaluateCondition(currentValue, condition.operator, condition.value);

      // Add SOL-specific data
      additionalData = {
        currentBalanceSOL: currentValue / LAMPORTS_PER_SOL,
        previousBalanceSOL: previousValue / LAMPORTS_PER_SOL,
        changeSOL: (currentValue - previousValue) / LAMPORTS_PER_SOL
      };

    } else if (watchType === 'token_balance') {
      // ----------------
      // TOKEN BALANCE WATCH
      // ----------------
      
      let tokenAccountExists = false;
      
      try {
        const mintPublicKey = new PublicKey(tokenMint!);
        
        // Get associated token account address
        const tokenAccountAddress = await getAssociatedTokenAddress(
          mintPublicKey,
          publicKey
        );

        context.logger(`watch-wallet: checking token account ${tokenAccountAddress.toBase58()}`);

        // Fetch token account
        const tokenAccount = await getAccount(connection, tokenAccountAddress);
        currentValue = Number(tokenAccount.amount);
        tokenAccountExists = true;
        
        context.logger(`watch-wallet: token account found, balance: ${currentValue}`);
        
      } catch (error: any) {
        // Token account doesn't exist = balance is 0
        const errorMsg = error.message || String(error);
        
        if (errorMsg.includes('could not find account') || 
            errorMsg.includes('Invalid account') ||
            errorMsg.includes('Account does not exist')) {
          currentValue = 0;
          tokenAccountExists = false;
          context.logger(`watch-wallet: token account not found, treating as 0 balance`);
        } else {
          // Unexpected error - log and rethrow
          context.logger(`watch-wallet: unexpected error fetching token account: ${errorMsg}`);
          throw new Error(`Failed to fetch token account: ${errorMsg}`);
        }
      }

      previousValue = previousWatch?.lastTokenBalance ? Number(previousWatch.lastTokenBalance) : 0;

      context.logger(`watch-wallet: token balance check - current: ${currentValue}, previous: ${previousValue}`);

      // Evaluate condition
      conditionMet = evaluateCondition(currentValue, condition.operator, condition.value);

      additionalData = {
        tokenMint: tokenMint,
        tokenAccountExists: tokenAccountExists,
        currentTokenBalance: currentValue,
        previousTokenBalance: previousValue,
        tokenChange: currentValue - previousValue
      };

    } else if (watchType === 'transaction') {
      // ----------------
      // TRANSACTION WATCH
      // ----------------
      
      // Fetch latest transaction signature
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1 });
      
      if (signatures.length === 0) {
        // No transactions found
        conditionMet = false;
        context.logger(`watch-wallet: no transactions found for wallet`);
        
      } else {
        const latestSignature = signatures[0]!.signature;
        const previousSignature = previousWatch?.lastSignature || null;

        // Condition is met if there's a NEW transaction (different signature)
        conditionMet = latestSignature !== previousSignature;

        context.logger(`watch-wallet: transaction check - latest: ${latestSignature}, previous: ${previousSignature || 'none'}, new: ${conditionMet}`);

        // Fetch transaction details if condition is met
        if (conditionMet) {
          try {
            const transaction = await connection.getTransaction(latestSignature, {
              maxSupportedTransactionVersion: 0
            });

            if (transaction) {
              additionalData.transaction = {
                signature: latestSignature,
                timestamp: transaction.blockTime,
                slot: transaction.slot,
                fee: transaction.meta?.fee || 0
              };
            }
          } catch (error) {
            context.logger(`watch-wallet: could not fetch transaction details: ${error}`);
          }
        }

        // Store latest signature for next check
        additionalData.lastSignature = latestSignature;
        additionalData.previousSignature = previousSignature;
      }
    }

    // ========================================
    // STEP 4: HANDLE FIRST CHECK LOGIC
    // ========================================
    
    // On first check, we might not want to trigger (user preference)
    if (isFirstCheck && !triggerOnFirstCheck) {
      context.logger(`watch-wallet: first check detected, skipping trigger (triggerOnFirstCheck=false)`);
      conditionMet = false;
    }

    // ========================================
    // STEP 5: UPDATE DATABASE WITH NEW STATE
    // ========================================
    
    const updateData: any = {
      watchType: watchType,
      lastCheckedAt: new Date()
    };

    if (watchType === 'balance') {
      updateData.lastBalance = BigInt(currentValue);
    } else if (watchType === 'token_balance') {
      updateData.lastTokenBalance = BigInt(currentValue);
      updateData.tokenMint = tokenMint;
    } else if (watchType === 'transaction' && additionalData.lastSignature) {
      updateData.lastSignature = additionalData.lastSignature;
    }

    // Upsert (update or create)
    await prisma.walletWatch.upsert({
      where: {
        flowId_nodeId_walletAddress: watchKey
      },
      update: updateData,
      create: {
        ...watchKey,
        ...updateData
      }
    });

    context.logger(`watch-wallet: database updated, condition met: ${conditionMet}`);

    // ========================================
    // STEP 6: RETURN RESULT
    // ========================================
    
    return {
      // Core result
      triggered: conditionMet,
      walletAddress: walletAddress,
      watchType: watchType,
      
      // Values (only for balance and token_balance)
      currentValue: watchType === 'transaction' ? undefined : currentValue,
      previousValue: watchType === 'transaction' ? undefined : previousValue,
      valueChange: watchType === 'transaction' ? undefined : currentValue - previousValue,
      changePercent: watchType === 'transaction' || previousValue === 0
        ? 0
        : ((currentValue - previousValue) / previousValue) * 100,
      
      // Condition info
      condition: {
        operator: condition.operator,
        targetValue: condition.value,
        met: conditionMet
      },
      
      // Metadata
      checkedAt: new Date().toISOString(),
      firstCheck: isFirstCheck,
      
      // Additional type-specific data
      ...additionalData
    };
  }
};

/**
 * Helper function to evaluate conditions
 */
function evaluateCondition(currentValue: number, operator: string, targetValue: number): boolean {
  switch (operator) {
    case '<':
      return currentValue < targetValue;
    case '>':
      return currentValue > targetValue;
    case '<=':
      return currentValue <= targetValue;
    case '>=':
      return currentValue >= targetValue;
    case '==':
      return currentValue === targetValue;
    case '!=':
      return currentValue !== targetValue;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}
