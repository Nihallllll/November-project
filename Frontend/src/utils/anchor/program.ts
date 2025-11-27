/**
 * Anchor Program Initialization
 * 
 * This module provides utilities to initialize the Anchor program
 * for interacting with the automation_platform smart contract.
 */

import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import IDL from '../../idl/automation_platform.json';

// Define the IDL type
type AutomationPlatformIDL = typeof IDL;

// Program ID - deployed on devnet (must match keypair)
export const PROGRAM_ID = new PublicKey('DTWoezuJiHHMUkQJh6QNVyeFt7EYbMB1n1gUMFFVvAUz');

// RPC endpoint
export const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('devnet');

/**
 * Get a connection to Solana
 */
export function getConnection(): Connection {
  return new Connection(RPC_ENDPOINT, 'confirmed');
}

/**
 * Create an Anchor Provider
 */
export function getProvider(wallet: AnchorWallet): AnchorProvider {
  const connection = getConnection();
  return new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
    commitment: 'confirmed',
  });
}

/**
 * Get the Anchor Program instance
 * For Anchor 0.30+, we need to use the correct initialization pattern
 */
export function getProgram(wallet: AnchorWallet) {
  const provider = getProvider(wallet);
  // Cast IDL and use the address from IDL
  // @ts-ignore - Anchor IDL type compatibility
  const program = new Program(IDL, provider);
  return program;
}

/**
 * Derive Voting PDA
 * Seeds: ["voting", creator_pubkey, seed_u64_le]
 */
export async function deriveVotingPDA(
  creator: PublicKey,
  seed: number | BN
): Promise<[PublicKey, number]> {
  const seedBN = typeof seed === 'number' ? new BN(seed) : seed;
  const seedBuffer = seedBN.toArrayLike(Buffer, 'le', 8);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('voting'), creator.toBuffer(), seedBuffer],
    PROGRAM_ID
  );
}

/**
 * Derive Multisig PDA
 * Seeds: ["multisig", creator_pubkey, seed_u64_le]
 */
export async function deriveMultisigPDA(
  creator: PublicKey,
  seed: number | BN
): Promise<[PublicKey, number]> {
  const seedBN = typeof seed === 'number' ? new BN(seed) : seed;
  const seedBuffer = seedBN.toArrayLike(Buffer, 'le', 8);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('multisig'), creator.toBuffer(), seedBuffer],
    PROGRAM_ID
  );
}

/**
 * Derive Escrow PDA
 * Seeds: ["escrow", buyer_pubkey, seed_u64_le]
 */
export async function deriveEscrowPDA(
  buyer: PublicKey,
  seed: number | BN
): Promise<[PublicKey, number]> {
  const seedBN = typeof seed === 'number' ? new BN(seed) : seed;
  const seedBuffer = seedBN.toArrayLike(Buffer, 'le', 8);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), buyer.toBuffer(), seedBuffer],
    PROGRAM_ID
  );
}

/**
 * Generate a unique seed based on timestamp
 */
export function generateSeed(): BN {
  return new BN(Date.now());
}

export { BN };
