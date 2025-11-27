/**
 * Voting Transaction Builders
 * 
 * Builds and sends transactions for:
 * - Initialize voting flow
 * - Cast vote
 * - Finalize voting
 */

import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram, getConnection, deriveVotingPDA, generateSeed } from '../anchor/program';

export interface CreateVotingParams {
  wallet: AnchorWallet;
  choices: string[];
  expiresAt?: number; // Unix timestamp in seconds
  allowedVoters?: string[]; // Optional whitelist of voter pubkeys
}

export interface CreateVotingResult {
  signature: string;
  votingPDA: string;
  seed: string;
  bump: number;
}

/**
 * Create a new voting proposal on-chain
 */
export async function createVotingTransaction(
  params: CreateVotingParams
): Promise<CreateVotingResult> {
  const { wallet, choices, expiresAt, allowedVoters } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  // Generate unique seed
  const seed = generateSeed();
  
  // Derive PDA
  const [votingPDA, bump] = await deriveVotingPDA(wallet.publicKey, seed);
  
  console.log('=== CREATE VOTING ON-CHAIN ===');
  console.log('Creator:', wallet.publicKey.toString());
  console.log('Seed:', seed.toString());
  console.log('Voting PDA:', votingPDA.toString());
  console.log('Choices:', choices);
  console.log('Expires At:', expiresAt);
  console.log('Allowed Voters:', allowedVoters);
  
  // Parse allowed voters to PublicKeys
  const allowedVotersPubkeys = allowedVoters?.length 
    ? allowedVoters.map(v => new PublicKey(v))
    : null;
  
  // Build and send transaction
  const tx = await program.methods
    .initializeVotingFlow(
      choices,
      seed,
      expiresAt ? new BN(expiresAt) : null,
      allowedVotersPubkeys
    )
    .accounts({
      creator: wallet.publicKey,
      flow: votingPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Transaction confirmed!');
  
  return {
    signature: tx,
    votingPDA: votingPDA.toString(),
    seed: seed.toString(),
    bump,
  };
}

export interface CastVoteParams {
  wallet: AnchorWallet;
  votingPDA: string;
  choiceIndex: number;
}

/**
 * Cast a vote on-chain
 */
export async function castVoteTransaction(
  params: CastVoteParams
): Promise<string> {
  const { wallet, votingPDA, choiceIndex } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== CAST VOTE ON-CHAIN ===');
  console.log('Voter:', wallet.publicKey.toString());
  console.log('Voting PDA:', votingPDA);
  console.log('Choice Index:', choiceIndex);
  
  const tx = await program.methods
    .castVote(choiceIndex)
    .accounts({
      voter: wallet.publicKey,
      flow: new PublicKey(votingPDA),
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Vote cast confirmed!');
  
  return tx;
}

export interface FinalizeVotingParams {
  wallet: AnchorWallet;
  votingPDA: string;
}

/**
 * Finalize voting on-chain
 */
export async function finalizeVotingTransaction(
  params: FinalizeVotingParams
): Promise<string> {
  const { wallet, votingPDA } = params;
  const program = getProgram(wallet);
  const connection = getConnection();
  
  console.log('=== FINALIZE VOTING ON-CHAIN ===');
  console.log('Signer:', wallet.publicKey.toString());
  console.log('Voting PDA:', votingPDA);
  
  const tx = await program.methods
    .finalizeVoting()
    .accounts({
      signer: wallet.publicKey,
      flow: new PublicKey(votingPDA),
    })
    .rpc();
  
  console.log('Transaction signature:', tx);
  
  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');
  console.log('Voting finalized!');
  
  return tx;
}

/**
 * Fetch voting account data from chain
 */
export async function fetchVotingAccount(votingPDA: string, wallet: AnchorWallet) {
  const program = getProgram(wallet);
  
  try {
    // @ts-ignore - IDL account typing
    const account = await program.account.votingFlow.fetch(new PublicKey(votingPDA));
    return {
      creator: account.creator.toString(),
      choices: account.choices,
      voteCounts: account.voteCounts.map((n: any) => n.toNumber ? n.toNumber() : n),
      voters: account.voters.map((v: PublicKey) => v.toString()),
      allowedVoters: account.allowedVoters?.map((v: PublicKey) => v.toString()) || null,
      finalized: account.finalized,
      winnerIndex: account.winnerIndex,
      expiresAt: account.expiresAt.toNumber(),
      createdAt: account.createdAt.toNumber(),
      bump: account.bump,
    };
  } catch (error) {
    console.error('Failed to fetch voting account:', error);
    return null;
  }
}
