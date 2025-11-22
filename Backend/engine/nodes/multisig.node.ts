/**
 * ================================================================
 * MULTISIG NODE - On-chain Multisig Proposals
 * ================================================================
 * 
 * Integrates with automation-contract program
 * Allows M-of-N signature approval workflows
 * 
 * Actions:
 * - create: Initialize new multisig proposal
 * - approve: Sign/approve a proposal
 * - reject: Reject a proposal
 * - check_status: Query proposal status
 * 
 * @version 1.0.0
 * @date November 2024
 * ================================================================
 */

import type { NodeHandler } from './node-handler.interface';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import getConnection from '../../config/web3';
import prisma from '../../config/database';

// TODO: Add program ID after deployment
const PROGRAM_ID = new PublicKey('3cxwG4X6k67rmaJzChP4sUqq8CnqMmuN6uM6bHKLRPz1');

interface MultisigNodeData {
  action: 'create' | 'approve' | 'reject' | 'check_status';
  
  // For 'create' action
  owners?: string[]; // Array of owner public keys
  threshold?: number;
  description?: string;
  expiresAt?: number; // Unix timestamp
  
  // For 'approve', 'reject', 'check_status' actions
  multisigAddress?: string; // PDA address of existing multisig
  
  // Common
  userId: string;
  flowId: string;
}

export const multisigNode: NodeHandler = {
  type: 'multisig',

  execute: async (nodeData: Record<string, any>, input: any, context: any) => {
    const data = nodeData as MultisigNodeData;
    const { action, userId, flowId } = data;

    context.logger(`multisig: starting ${action} action`);

    try {
      const connection = getConnection();

      switch (action) {
        case 'create':
          return await createMultisig(data, context, connection);
        
        case 'approve':
          return await approveMultisig(data, context, connection);
        
        case 'reject':
          return await rejectMultisig(data, context, connection);
        
        case 'check_status':
          return await checkMultisigStatus(data, context, connection);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      context.logger(`multisig: error - ${error.message}`);
      return {
        success: false,
        error: error.message,
        action
      };
    }
  }
};

// ============================================================================
// CREATE MULTISIG
// ============================================================================

async function createMultisig(
  data: MultisigNodeData,
  context: any,
  connection: Connection
) {
  const { owners, threshold, description, expiresAt, userId, flowId } = data;

  // Validate inputs
  if (!owners || owners.length === 0) {
    throw new Error('owners array is required');
  }
  if (!threshold || threshold < 1) {
    throw new Error('threshold must be at least 1');
  }
  if (threshold > owners.length) {
    throw new Error('threshold cannot exceed number of owners');
  }
  if (owners.length > 10) {
    throw new Error('maximum 10 owners allowed');
  }

  // Generate unique seed for this multisig
  const seed = Date.now();

  // TODO: Replace with actual program interaction after IDL is added
  // For now, derive the PDA address
  const creatorPubkey = new PublicKey(owners[0]!); // First owner is creator
  const [multisigPDA, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('multisig'),
      creatorPubkey.toBuffer(),
      Buffer.from(seed.toString().padStart(8, '0'))
    ],
    PROGRAM_ID
  );

  context.logger(`multisig: derived PDA: ${multisigPDA.toString()}`);

  // Save to database
  const dbRecord = await prisma.multisigProposal.create({
    data: {
      id: multisigPDA.toString(),
      flowId,
      userId,
      creator: owners[0] !,
      owners: owners,
      threshold: threshold,
      description: description || '',
      status: 'pending',
      approvals: [],
      rejections: [],
      executed: false,
      expiresAt: expiresAt ? new Date(expiresAt * 1000) : new Date(Date.now() + 3600000),
      seed: seed.toString(),
      bump: bump
    }
  });

  context.logger(`multisig: saved to database with ID: ${dbRecord.id}`);

  // Generate signing links for each owner
  const signingLinks = owners.map(owner => ({
    signer: owner,
    link: `${process.env.FRONTEND_URL}/sign/multisig/${multisigPDA.toString()}?signer=${owner}`,
  }));

  return {
    success: true,
    action: 'create',
    multisigAddress: multisigPDA.toString(),
    creator: owners[0],
    owners: owners,
    threshold: threshold,
    description: description || '',
    status: 'pending',
    currentApprovals: 0,
    requiredApprovals: threshold,
    signingLinks: signingLinks,
    expiresAt: expiresAt,
    seed: seed,
    message: `Multisig proposal created. ${threshold}/${owners.length} signatures required.`
  };
}

// ============================================================================
// APPROVE MULTISIG
// ============================================================================

async function approveMultisig(
  data: MultisigNodeData,
  context: any,
  connection: Connection
) {
  const { multisigAddress, userId } = data;

  if (!multisigAddress) {
    throw new Error('multisigAddress is required for approve action');
  }

  // Fetch from database
  const proposal = await prisma.multisigProposal.findUnique({
    where: { id: multisigAddress }
  });

  if (!proposal) {
    throw new Error('Multisig proposal not found');
  }

  // Check if already expired
  if (new Date() > proposal.expiresAt) {
    throw new Error('Proposal has expired');
  }

  // Check if user is an owner
  if (!proposal.owners.includes(userId)) {
    throw new Error('User is not an owner of this multisig');
  }

  // Check if already voted
  if (proposal.approvals.includes(userId) || proposal.rejections.includes(userId)) {
    throw new Error('User has already voted on this proposal');
  }

  // TODO: Call on-chain program to approve
  // For now, update database
  const updatedProposal = await prisma.multisigProposal.update({
    where: { id: multisigAddress },
    data: {
      approvals: {
        push: userId
      }
    }
  });

  // Check if threshold met
  const thresholdMet = updatedProposal.approvals.length >= proposal.threshold;

  if (thresholdMet) {
    await prisma.multisigProposal.update({
      where: { id: multisigAddress },
      data: {
        status: 'approved',
        executed: true,
        executedAt: new Date()
      }
    });
  }

  context.logger(`multisig: approved by ${userId}. ${updatedProposal.approvals.length}/${proposal.threshold} signatures collected`);

  return {
    success: true,
    action: 'approve',
    multisigAddress,
    currentApprovals: updatedProposal.approvals.length,
    requiredApprovals: proposal.threshold,
    thresholdMet,
    status: thresholdMet ? 'approved' : 'pending',
    approvers: updatedProposal.approvals,
    message: thresholdMet 
      ? 'Threshold met! Proposal approved and executed.'
      : `Approval recorded. ${updatedProposal.approvals.length}/${proposal.threshold} signatures collected.`
  };
}

// ============================================================================
// REJECT MULTISIG
// ============================================================================

async function rejectMultisig(
  data: MultisigNodeData,
  context: any,
  connection: Connection
) {
  const { multisigAddress, userId } = data;

  if (!multisigAddress) {
    throw new Error('multisigAddress is required for reject action');
  }

  // Fetch from database
  const proposal = await prisma.multisigProposal.findUnique({
    where: { id: multisigAddress }
  });

  if (!proposal) {
    throw new Error('Multisig proposal not found');
  }

  // Check if already expired
  if (new Date() > proposal.expiresAt) {
    throw new Error('Proposal has expired');
  }

  // Check if user is an owner
  if (!proposal.owners.includes(userId)) {
    throw new Error('User is not an owner of this multisig');
  }

  // Check if already voted
  if (proposal.approvals.includes(userId) || proposal.rejections.includes(userId)) {
    throw new Error('User has already voted on this proposal');
  }

  // TODO: Call on-chain program to reject
  // For now, update database
  await prisma.multisigProposal.update({
    where: { id: multisigAddress },
    data: {
      rejections: {
        push: userId
      },
      status: 'rejected',
      executed: true,
      executedAt: new Date()
    }
  });

  context.logger(`multisig: rejected by ${userId}`);

  return {
    success: true,
    action: 'reject',
    multisigAddress,
    status: 'rejected',
    rejector: userId,
    message: 'Proposal rejected.'
  };
}

// ============================================================================
// CHECK STATUS
// ============================================================================

async function checkMultisigStatus(
  data: MultisigNodeData,
  context: any,
  connection: Connection
) {
  const { multisigAddress } = data;

  if (!multisigAddress) {
    throw new Error('multisigAddress is required for check_status action');
  }

  // Fetch from database
  const proposal = await prisma.multisigProposal.findUnique({
    where: { id: multisigAddress }
  });

  if (!proposal) {
    throw new Error('Multisig proposal not found');
  }

  // TODO: Query on-chain account for real-time status
  // For now, return database state

  const isExpired = new Date() > proposal.expiresAt;

  return {
    success: true,
    action: 'check_status',
    multisigAddress,
    creator: proposal.creator,
    owners: proposal.owners,
    threshold: proposal.threshold,
    description: proposal.description,
    status: proposal.status,
    executed: proposal.executed,
    currentApprovals: proposal.approvals.length,
    currentRejections: proposal.rejections.length,
    approvals: proposal.approvals,
    rejections: proposal.rejections,
    thresholdMet: proposal.approvals.length >= proposal.threshold,
    isExpired,
    expiresAt: proposal.expiresAt.toISOString(),
    createdAt: proposal.createdAt.toISOString(),
    executedAt: proposal.executedAt?.toISOString()
  };
}
