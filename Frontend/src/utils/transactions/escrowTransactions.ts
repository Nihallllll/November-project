/**
 * Escrow Transaction Builders
 * 
 * Builds and sends transactions for:
 * - Initialize escrow
 * - Mark delivered
 * - Buyer approve
 * - Raise dispute
 * - Resolve dispute
 * - Auto release
 */

import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram, getConnection, deriveEscrowPDA, generateSeed } from '../anchor/program';

export interface CreateEscrowParams {
  wallet: AnchorWallet; // Buyer
  seller: string;
  amount: number; // In SOL
  description: string;
  disputeWindowDays: number;
  arbitrator?: string;
}

export interface CreateEscrowResult {
  signature: string;
  escrowPDA: string;
  seed: string;
  bump: number;
}

/**
 * Create a new escrow on-chain (buyer initiates)
 */
export async function createEscrowTransaction(
  params: CreateEscrowParams
): Promise<CreateEscrowResult> {
  const { wallet, seller, amount, description, disputeWindowDays, arbitrator } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  // Generate unique seed
  const seed = generateSeed();
  
  // Derive PDA
  const [escrowPDA, bump] = await deriveEscrowPDA(wallet.publicKey, seed);
  
  // Convert SOL to lamports
  const amountLamports = new BN(Math.floor(amount * LAMPORTS_PER_SOL));
  
  console.log('=== CREATE ESCROW ON-CHAIN ===');
  console.log('Buyer:', wallet.publicKey.toString());
  console.log('Seller:', seller);
  console.log('Amount:', amount, 'SOL (', amountLamports.toString(), 'lamports)');
  console.log('Seed:', seed.toString());
  console.log('Escrow PDA:', escrowPDA.toString());
  console.log('Description:', description);
  console.log('Dispute Window:', disputeWindowDays, 'days');
  console.log('Arbitrator:', arbitrator || 'None');
  
  // Build and send transaction
  const tx = await program.methods
    .initializeEscrow(
      new PublicKey(seller),
      amountLamports,
      description,
      disputeWindowDays,
      arbitrator ? new PublicKey(arbitrator) : null,
      seed
    )
    .accounts({
      buyer: wallet.publicKey,
      flow: escrowPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Transaction confirmed!');
  
  return {
    signature: tx,
    escrowPDA: escrowPDA.toString(),
    seed: seed.toString(),
    bump,
  };
}

export interface MarkDeliveredParams {
  wallet: AnchorWallet; // Seller
  escrowPDA: string;
  buyerPubkey: string;
  seed: string;
}

/**
 * Seller marks item as delivered
 */
export async function markDeliveredTransaction(
  params: MarkDeliveredParams
): Promise<string> {
  const { wallet, escrowPDA } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== MARK DELIVERED ON-CHAIN ===');
  console.log('Seller:', wallet.publicKey.toString());
  console.log('Escrow PDA:', escrowPDA);
  
  const tx = await program.methods
    .markDelivered()
    .accounts({
      seller: wallet.publicKey,
      flow: new PublicKey(escrowPDA),
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Delivery marked!');
  
  return tx;
}

export interface BuyerApproveParams {
  wallet: AnchorWallet; // Buyer
  escrowPDA: string;
  sellerPubkey: string;
}

/**
 * Buyer approves and releases funds to seller
 */
export async function buyerApproveTransaction(
  params: BuyerApproveParams
): Promise<string> {
  const { wallet, escrowPDA, sellerPubkey } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== BUYER APPROVE ON-CHAIN ===');
  console.log('Buyer:', wallet.publicKey.toString());
  console.log('Escrow PDA:', escrowPDA);
  console.log('Seller:', sellerPubkey);
  
  const tx = await program.methods
    .buyerApprove()
    .accounts({
      buyer: wallet.publicKey,
      flow: new PublicKey(escrowPDA),
      seller: new PublicKey(sellerPubkey),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Funds released to seller!');
  
  return tx;
}

export interface RaiseDisputeParams {
  wallet: AnchorWallet; // Buyer or Seller
  escrowPDA: string;
  reason: string;
}

/**
 * Raise a dispute on the escrow
 */
export async function raiseDisputeTransaction(
  params: RaiseDisputeParams
): Promise<string> {
  const { wallet, escrowPDA, reason } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== RAISE DISPUTE ON-CHAIN ===');
  console.log('Disputer:', wallet.publicKey.toString());
  console.log('Escrow PDA:', escrowPDA);
  console.log('Reason:', reason);
  
  const tx = await program.methods
    .raiseDispute(reason)
    .accounts({
      disputer: wallet.publicKey,
      flow: new PublicKey(escrowPDA),
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Dispute raised!');
  
  return tx;
}

export interface ResolveDisputeParams {
  wallet: AnchorWallet; // Arbitrator
  escrowPDA: string;
  winnerIsBuyer: boolean;
  winnerPubkey: string;
}

/**
 * Arbitrator resolves the dispute
 */
export async function resolveDisputeTransaction(
  params: ResolveDisputeParams
): Promise<string> {
  const { wallet, escrowPDA, winnerIsBuyer, winnerPubkey } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== RESOLVE DISPUTE ON-CHAIN ===');
  console.log('Arbitrator:', wallet.publicKey.toString());
  console.log('Escrow PDA:', escrowPDA);
  console.log('Winner is buyer:', winnerIsBuyer);
  console.log('Winner:', winnerPubkey);
  
  const tx = await program.methods
    .resolveDispute(winnerIsBuyer)
    .accounts({
      arbitrator: wallet.publicKey,
      flow: new PublicKey(escrowPDA),
      winner: new PublicKey(winnerPubkey),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Dispute resolved!');
  
  return tx;
}

export interface AutoReleaseParams {
  wallet: AnchorWallet;
  escrowPDA: string;
  sellerPubkey: string;
}

/**
 * Auto-release funds after dispute window expires
 */
export async function autoReleaseTransaction(
  params: AutoReleaseParams
): Promise<string> {
  const { wallet, escrowPDA, sellerPubkey } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== AUTO RELEASE ON-CHAIN ===');
  console.log('Caller:', wallet.publicKey.toString());
  console.log('Escrow PDA:', escrowPDA);
  console.log('Seller:', sellerPubkey);
  
  const tx = await program.methods
    .autoRelease()
    .accounts({
      caller: wallet.publicKey,
      flow: new PublicKey(escrowPDA),
      seller: new PublicKey(sellerPubkey),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Funds auto-released!');
  
  return tx;
}

/**
 * Fetch escrow account data from chain
 */
export async function fetchEscrowAccount(escrowPDA: string, wallet: AnchorWallet) {
  const program = getProgram(wallet);
  
  try {
    // @ts-ignore - IDL account typing
    const account = await program.account.escrowFlow.fetch(new PublicKey(escrowPDA));
    return {
      buyer: account.buyer.toString(),
      seller: account.seller.toString(),
      arbitrator: account.arbitrator?.toString() || null,
      amount: account.amount.toNumber() / LAMPORTS_PER_SOL,
      amountLamports: account.amount.toNumber(),
      description: account.description,
      disputeWindowDays: account.disputeWindowDays,
      status: Object.keys(account.status)[0],
      sellerDelivered: account.sellerDelivered,
      sellerDeliveredAt: account.sellerDeliveredAt?.toNumber() || null,
      buyerApproved: account.buyerApproved,
      disputed: account.disputed,
      disputeRaisedAt: account.disputeRaisedAt?.toNumber() || null,
      disputeReason: account.disputeReason || null,
      winner: account.winner?.toString() || null,
      decidedAt: account.decidedAt?.toNumber() || null,
      createdAt: account.createdAt.toNumber(),
      seed: account.seed.toString(),
      bump: account.bump,
    };
  } catch (error) {
    console.error('Failed to fetch escrow account:', error);
    return null;
  }
}
