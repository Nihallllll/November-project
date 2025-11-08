import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { NodeHandler } from "./node-handler.interface";

export const tokenProgramNode: NodeHandler = {
  type: "token_program",

  execute: async (nodeData,input  ,context): Promise<any> => {
    try {
      // Validate
      if (!nodeData.action) throw new Error("action is required");
      if (!nodeData.rpcUrl) throw new Error("rpcUrl is required");
      if (!nodeData.tokenMint) throw new Error("tokenMint is required");

      const connection = new Connection(nodeData.rpcUrl, "confirmed");
      const mintAddress = new PublicKey(nodeData.tokenMint);

      let result;

      switch (nodeData.action) {
        case "getBalance":
          // Get token balance for a wallet
          result = await getTokenBalance(connection, mintAddress, nodeData.owner);
          break;

        case "getTokenAccountsByOwner":
          // Get all token accounts for a wallet
          result = await getTokenAccounts(
            connection,
            mintAddress,
            nodeData.owner
          );
          break;

        case "getAccountInfo":
          // Get info about a specific token account
          result = await getTokenAccountInfo(connection, nodeData.tokenAccount);
          break;

        case "transfer":
          // Transfer tokens (this requires private key - handle carefully)
          result = await transferTokens(
            connection,
            nodeData.from,
            nodeData.to,
            nodeData.amount,
            nodeData.privateKey
          );
          break;

        default:
          throw new Error(`Unknown action: ${nodeData.action}`);
      }

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

// Helper function: Get token balance
async function getTokenBalance(
  connection: Connection,
  mintAddress: PublicKey,
  ownerAddress: string
) {
  if (!ownerAddress) throw new Error("owner address is required");

  const owner = new PublicKey(ownerAddress);

  // Get associated token address
  const tokenAccount = await getAssociatedTokenAddress(mintAddress, owner);

  // Get account info
  const accountInfo = await getAccount(connection, tokenAccount);

  return {
    balance: Number(accountInfo.amount),
    decimals: accountInfo.mint, // You can fetch decimals from mint if needed
    tokenAccount: tokenAccount.toBase58(),
  };
}

// Helper function: Get all token accounts
async function getTokenAccounts(
  connection: Connection,
  mintAddress: PublicKey,
  ownerAddress: string
) {
  if (!ownerAddress) throw new Error("owner address is required");

  const owner = new PublicKey(ownerAddress);

  const accounts = await connection.getTokenAccountsByOwner(owner, {
    mint: mintAddress,
  });

  return accounts.value.map((account) => ({
    pubkey: account.pubkey.toBase58(),
    account: account.account,
  }));
}

// Helper function: Get token account info
async function getTokenAccountInfo(
  connection: Connection,
  tokenAccountAddress: string
) {
  if (!tokenAccountAddress) throw new Error("tokenAccount address is required");

  const tokenAccount = new PublicKey(tokenAccountAddress);
  const accountInfo = await getAccount(connection, tokenAccount);

  return {
    address: tokenAccountAddress,
    mint: accountInfo.mint.toBase58(),
    owner: accountInfo.owner.toBase58(),
    amount: Number(accountInfo.amount),
    delegateOption: accountInfo.delegate,
    isInitialized: accountInfo.isInitialized,
    isFrozen: accountInfo.isFrozen,
  };
}

// Helper function: Transfer tokens
async function transferTokens(
  connection: Connection,
  fromAddress: string,
  toAddress: string,
  amount: number,
  privateKeyString: string
) {
  if (!fromAddress) throw new Error("from address is required");
  if (!toAddress) throw new Error("to address is required");
  if (!amount || amount <= 0) throw new Error("valid amount is required");
  if (!privateKeyString) throw new Error("private key is required");

  // Note: This is a simplified version
  // In production, you'd want to:
  // 1. Get private key from context/credentials (encrypted)
  // 2. Build transaction properly
  // 3. Handle multiple instructions if needed

  throw new Error(
    "Transfer not implemented yet - requires proper key management"
  );

  // TODO: Implement when credential management is ready
}
