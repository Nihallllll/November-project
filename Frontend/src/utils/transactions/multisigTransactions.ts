/**
 * Multisig Transaction Builders
 * 
 * Builds and sends transactions for:
 * - Initialize multisig flow
 * - Approve flow
 * - Reject flow
 */

import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram, getConnection, deriveMultisigPDA, generateSeed } from '../anchor/program';

export interface CreateMultisigParams {
  wallet: AnchorWallet;
  owners: string[]; // Array of owner pubkeys
  threshold: number;
  description: string;
  expiresAt?: number; // Unix timestamp in seconds
}

export interface CreateMultisigResult {
  signature: string;
  multisigPDA: string;
  seed: string;
  bump: number;
}

/**
 * Create a new multisig proposal on-chain
 */
export async function createMultisigTransaction(
  params: CreateMultisigParams
): Promise<CreateMultisigResult> {
  const { wallet, owners, threshold, description, expiresAt } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  // Generate unique seed
  const seed = generateSeed();
  
  // Derive PDA
  const [multisigPDA, bump] = await deriveMultisigPDA(wallet.publicKey, seed);
  
  console.log('=== CREATE MULTISIG ON-CHAIN ===');
  console.log('Creator:', wallet.publicKey.toString());
  console.log('Seed:', seed.toString());
  console.log('Multisig PDA:', multisigPDA.toString());
  console.log('Owners:', owners);
  console.log('Threshold:', threshold);
  console.log('Description:', description);
  
  // Parse owners to PublicKeys
  const ownersPubkeys = owners.map(o => new PublicKey(o));
  
  // Build and send transaction
  const tx = await program.methods
    .initializeMultisigFlow(
      ownersPubkeys,
      threshold,
      description,
      seed,
      expiresAt ? new BN(expiresAt) : null
    )
    .accounts({
      creator: wallet.publicKey,
      flow: multisigPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Transaction confirmed!');
  
  return {
    signature: tx,
    multisigPDA: multisigPDA.toString(),
    seed: seed.toString(),
    bump,
  };
}

export interface ApproveFlowParams {
  wallet: AnchorWallet;
  multisigPDA: string;
}

/**
 * Approve a multisig flow on-chain
 */
export async function approveFlowTransaction(
  params: ApproveFlowParams
): Promise<string> {
  const { wallet, multisigPDA } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== APPROVE MULTISIG ON-CHAIN ===');
  console.log('Signer:', wallet.publicKey.toString());
  console.log('Multisig PDA:', multisigPDA);
  
  const tx = await program.methods
    .approveFlow()
    .accounts({
      signer: wallet.publicKey,
      flow: new PublicKey(multisigPDA),
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Approval confirmed!');
  
  return tx;
}

export interface RejectFlowParams {
  wallet: AnchorWallet;
  multisigPDA: string;
}

/**
 * Reject a multisig flow on-chain
 */
export async function rejectFlowTransaction(
  params: RejectFlowParams
): Promise<string> {
  const { wallet, multisigPDA } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== REJECT MULTISIG ON-CHAIN ===');
  console.log('Signer:', wallet.publicKey.toString());
  console.log('Multisig PDA:', multisigPDA);
  
  const tx = await program.methods
    .rejectFlow()
    .accounts({
      signer: wallet.publicKey,
      flow: new PublicKey(multisigPDA),
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Rejection confirmed!');
  
  return tx;
}

/**
 * Fetch multisig account data from chain
 */
export async function fetchMultisigAccount(multisigPDA: string, wallet: AnchorWallet) {
  const program = getProgram(wallet);
  
  try {
    // @ts-ignore - IDL account typing
    const account = await program.account.multisigFlow.fetch(new PublicKey(multisigPDA));
    return {
      creator: account.creator.toString(),
      owners: account.owners.map((o: PublicKey) => o.toString()),
      threshold: account.threshold,
      description: account.description,
      approvals: account.approvals.map((a: PublicKey) => a.toString()),
      rejections: account.rejections.map((r: PublicKey) => r.toString()),
      executed: account.executed,
      expiresAt: account.expiresAt.toNumber(),
      createdAt: account.createdAt.toNumber(),
      bump: account.bump,
    };
  } catch (error) {
    console.error('Failed to fetch multisig account:', error);
    return null;
  }
}
