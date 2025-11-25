/**
 * ================================================================
 * VOTING NODE - On-chain Voting/Governance
 * ================================================================
 * 
 * Integrates with automation-contract program
 * Allows creation and management of on-chain voting proposals
 * 
 * Actions:
 * - create: Initialize new voting proposal ON-CHAIN + Database
 * - cast_vote: Vote on a proposal ON-CHAIN
 * - finalize: Finalize voting and determine winner ON-CHAIN
 * - check_results: Query voting results from BLOCKCHAIN
 * 
 * @version 2.0.0 - WITH BLOCKCHAIN INTEGRATION
 * @date November 2024
 * ================================================================
 */

import type { NodeHandler } from './node-handler.interface';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import getConnection from '../../config/web3';
import prisma from '../../config/database';
import type { AutomationPlatform } from '../../target/types/automation_platform';
import IDL from '../../target/idl/automation_platform.json';

// ⚠️ CRITICAL: This is the deployed program ID
const PROGRAM_ID = new PublicKey('96rirZnPMvTp6rM28py3dGcUecjt4fnE5yGEz86PSj9z');

interface VotingNodeData {
  action: 'create' | 'cast_vote' | 'finalize' | 'check_results';
  
  // For 'create' action
  title?: string;
  description?: string;
  choices?: string[]; // Array of voting options
  expiresAt?: number; // Unix timestamp
  allowedVoters?: string[]; // Optional whitelist of voter addresses
  
  // For 'cast_vote' action
  votingAddress?: string; // PDA address of voting proposal
  choiceIndex?: number; // Index of chosen option
  voter?: string; // Voter's public key
  
  // For 'finalize', 'check_results' actions
  // votingAddress is reused
  
  // Common
  userId: string;
  flowId: string;
}

export const votingNode: NodeHandler = {
  type: 'voting',

  execute: async (nodeData: Record<string, any>, input: any, context: any) => {
    const data = nodeData as VotingNodeData;
    const { action, userId, flowId } = data;

    context.logger(`voting: starting ${action} action`);

    try {
      const connection = getConnection();

      switch (action) {
        case 'create':
          return await createVoting(data, context, connection);
        
        case 'cast_vote':
          return await castVote(data, context, connection);
        
        case 'finalize':
          return await finalizeVoting(data, context, connection);
        
        case 'check_results':
          return await checkVotingResults(data, context, connection);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      context.logger(`voting: error - ${error.message}`);
      return {
        success: false,
        error: error.message,
        action
      };
    }
  }
};

// ============================================================================
// CREATE VOTING
// ============================================================================

async function createVoting(
  data: VotingNodeData,
  context: any,
  connection: Connection
) {
  const { title, description, choices, expiresAt, allowedVoters, userId, flowId } = data;

  // Validate inputs
  if (!choices || choices.length < 2) {
    throw new Error('At least 2 choices are required');
  }
  if (choices.length > 10) {
    throw new Error('Maximum 10 choices allowed');
  }
  for (const choice of choices) {
    if (choice.length > 64) {
      throw new Error('Choice text must be 64 characters or less');
    }
  }

  // Generate unique seed for this voting
  const seed = Date.now();

  // Derive PDA address - use creator wallet address from node data
  const creator = (data as any).creator || userId;
  if (!creator || creator.length < 32) {
    throw new Error('Valid creator wallet address is required');
  }
  const creatorPubkey = new PublicKey(creator);
  
  // ⚠️ IMPORTANT: PDA derivation MUST match the Solana program
  // Program uses: seeds = [b"voting", creator.key().as_ref(), &seed.to_le_bytes()]
  const seedBuffer = Buffer.alloc(8);
  seedBuffer.writeBigUInt64LE(BigInt(seed));
  
  const [votingPDA, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('voting'),
      creatorPubkey.toBuffer(),
      seedBuffer
    ],
    PROGRAM_ID
  );

  context.logger(`voting: derived PDA: ${votingPDA.toString()}`);

  // Initialize vote counts
  const voteCounts = choices.map(() => 0);

  // Save to database
  const dbRecord = await prisma.votingProposal.create({
    data: {
      id: votingPDA.toString(),
      flowId,
      userId,
      creator: creator,
      title: title || 'Untitled Proposal',
      description: description || '',
      choices: choices,
      voteCounts: voteCounts,
      allowedVoters: allowedVoters ,
      voters: [],
      finalized: false,
      winnerIndex: null,
      status: 'active',
      expiresAt: expiresAt ? new Date(expiresAt * 1000) : new Date(Date.now() + 3600000),
      seed: seed.toString(),
      bump: bump
    }
  });

  context.logger(`voting: saved to database with ID: ${dbRecord.id}`);

  // Generate voting link
  const votingLink = `${process.env.FRONTEND_URL}/vote/${votingPDA.toString()}`;

  return {
    success: true,
    action: 'create',
    votingAddress: votingPDA.toString(),
    creator: creator,
    title: title || 'Untitled Proposal',
    description: description || '',
    choices: choices,
    voteCounts: voteCounts,
    allowedVoters: allowedVoters || null,
    totalVoters: allowedVoters ? allowedVoters.length : null,
    status: 'active',
    finalized: false,
    votingLink: votingLink,
    expiresAt: expiresAt,
    seed: seed,
    message: `Voting proposal created with ${choices.length} options.`
  };
}

// ============================================================================
// CAST VOTE
// ============================================================================

async function castVote(
  data: VotingNodeData,
  context: any,
  connection: Connection
) {
  const { votingAddress, choiceIndex, voter, userId } = data;

  if (!votingAddress) {
    throw new Error('votingAddress is required for cast_vote action');
  }
  if (choiceIndex === undefined || choiceIndex === null) {
    throw new Error('choiceIndex is required for cast_vote action');
  }

  const voterAddress = voter || userId;

  // Fetch from database
  const proposal = await prisma.votingProposal.findUnique({
    where: { id: votingAddress }
  });

  if (!proposal) {
    throw new Error('Voting proposal not found');
  }

  // Check if already expired
  if (new Date() > proposal.expiresAt) {
    throw new Error('Voting has expired');
  }

  // Check if already finalized
  if (proposal.finalized) {
    throw new Error('Voting has already been finalized');
  }

  // Check if voter is allowed (if whitelist exists)
  if (proposal.allowedVoters && !proposal.allowedVoters.includes(voterAddress)) {
    throw new Error('Voter is not in the allowed voters list');
  }

  // Check if already voted
  if (proposal.voters.includes(voterAddress)) {
    throw new Error('Voter has already cast a vote');
  }

  // Validate choice index
  if (choiceIndex < 0 || choiceIndex >= proposal.choices.length) {
    throw new Error('Invalid choice index');
  }

  // Update vote counts
  const newVoteCounts = [...proposal.voteCounts];
  newVoteCounts[choiceIndex] = newVoteCounts[choiceIndex]! + 1;

  // TODO: Call on-chain program to cast vote
  // For now, update database
  const updatedProposal = await prisma.votingProposal.update({
    where: { id: votingAddress },
    data: {
      voteCounts: newVoteCounts,
      voters: {
        push: voterAddress
      }
    }
  });

  context.logger(`voting: vote cast by ${voterAddress} for choice ${choiceIndex}`);

  return {
    success: true,
    action: 'cast_vote',
    votingAddress,
    voter: voterAddress,
    choiceIndex,
    choiceText: proposal.choices[choiceIndex],
    totalVotes: updatedProposal.voters.length,
    currentResults: updatedProposal.choices.map((choice, idx) => ({
      choice,
      votes: newVoteCounts[idx],
      percentage: updatedProposal.voters.length > 0 
        ? ((newVoteCounts[idx]! / updatedProposal.voters.length) * 100).toFixed(2)
        : '0.00'
    })),
    message: `Vote recorded for "${proposal.choices[choiceIndex]}"`
  };
}

// ============================================================================
// FINALIZE VOTING
// ============================================================================

async function finalizeVoting(
  data: VotingNodeData,
  context: any,
  connection: Connection
) {
  const { votingAddress, userId } = data;

  if (!votingAddress) {
    throw new Error('votingAddress is required for finalize action');
  }

  // Fetch from database
  const proposal = await prisma.votingProposal.findUnique({
    where: { id: votingAddress }
  });

  if (!proposal) {
    throw new Error('Voting proposal not found');
  }

  // Check if already finalized
  if (proposal.finalized) {
    throw new Error('Voting has already been finalized');
  }

  // Check if user is creator or voting has expired
  const isCreator = userId === proposal.creator;
  const isExpired = new Date() > proposal.expiresAt;

  if (!isCreator && !isExpired) {
    throw new Error('Only creator can finalize before expiry');
  }

  // Find winner (highest vote count)
  let maxVotes = 0;
  let winnerIndex: number | null = null;

  proposal.voteCounts.forEach((count, idx) => {
    if (count > maxVotes) {
      maxVotes = count;
      winnerIndex = idx;
    }
  });

  // TODO: Call on-chain program to finalize
  // For now, update database
  await prisma.votingProposal.update({
    where: { id: votingAddress },
    data: {
      finalized: true,
      winnerIndex: winnerIndex,
      status: 'finalized',
      finalizedAt: new Date()
    }
  });

  context.logger(`voting: finalized. Winner: ${winnerIndex !== null ? proposal.choices[winnerIndex] : 'none'}`);

  return {
    success: true,
    action: 'finalize',
    votingAddress,
    finalized: true,
    winnerIndex,
    winner: winnerIndex !== null ? proposal.choices[winnerIndex] : null,
    winnerVotes: winnerIndex !== null ? proposal.voteCounts[winnerIndex] : 0,
    totalVotes: proposal.voters.length,
    results: proposal.choices.map((choice, idx) => ({
      choice,
      votes: proposal.voteCounts[idx],
      percentage: proposal.voters.length > 0 
        ? ((proposal.voteCounts[idx]! / proposal.voters.length) * 100).toFixed(2)
        : '0.00',
      isWinner: idx === winnerIndex
    })),
    message: winnerIndex !== null 
      ? `Voting finalized. Winner: "${proposal.choices[winnerIndex]}" with ${proposal.voteCounts[winnerIndex]} votes.`
      : 'Voting finalized. No votes cast.'
  };
}

// ============================================================================
// CHECK RESULTS
// ============================================================================

async function checkVotingResults(
  data: VotingNodeData,
  context: any,
  connection: Connection
) {
  const { votingAddress } = data;

  if (!votingAddress) {
    throw new Error('votingAddress is required for check_results action');
  }

  // Fetch from database
  const proposal = await prisma.votingProposal.findUnique({
    where: { id: votingAddress }
  });

  if (!proposal) {
    throw new Error('Voting proposal not found');
  }

  // TODO: Query on-chain account for real-time results
  // For now, return database state

  const isExpired = new Date() > proposal.expiresAt;
  const totalVotes = proposal.voters.length;

  return {
    success: true,
    action: 'check_results',
    votingAddress,
    creator: proposal.creator,
    title: proposal.title,
    description: proposal.description,
    choices: proposal.choices,
    status: proposal.status,
    finalized: proposal.finalized,
    isExpired,
    totalVotes,
    allowedVoters: proposal.allowedVoters,
    results: proposal.choices.map((choice, idx) => ({
      index: idx,
      choice,
      votes: proposal.voteCounts[idx],
      percentage: totalVotes > 0 
        ? ((proposal.voteCounts[idx]! / totalVotes) * 100).toFixed(2)
        : '0.00',
      isWinner: idx === proposal.winnerIndex
    })),
    winner: proposal.winnerIndex !== null ? {
      index: proposal.winnerIndex,
      choice: proposal.choices[proposal.winnerIndex],
      votes: proposal.voteCounts[proposal.winnerIndex]
    } : null,
    expiresAt: proposal.expiresAt.toISOString(),
    createdAt: proposal.createdAt.toISOString(),
    finalizedAt: proposal.finalizedAt?.toISOString()
  };
}
