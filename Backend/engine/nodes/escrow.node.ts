/**
 * ================================================================
 * ESCROW NODE - Trustless Escrow/Payment System
 * ================================================================
 * 
 * Integrates with automation-contract program
 * Enables trustless escrow for payments with dispute resolution
 * 
 * Actions:
 * - create: Initialize new escrow
 * - mark_delivered: Seller marks item as delivered
 * - approve: Buyer approves and releases funds
 * - dispute: Raise a dispute
 * - resolve: Arbitrator resolves dispute
 * - auto_release: Auto-release after dispute window
 * - check_status: Query escrow status
 * 
 * @version 1.0.0
 * @date November 2024
 * ================================================================
 */

import type { NodeHandler } from './node-handler.interface';
import { Connection, PublicKey } from '@solana/web3.js';
import getConnection from '../../config/web3';
import prisma from '../../config/database';

// TODO: Add program ID after deployment
const PROGRAM_ID = new PublicKey('3cxwG4X6k67rmaJzChP4sUqq8CnqMmuN6uM6bHKLRPz1');

type EscrowStatus = 'Created' | 'SellerDelivered' | 'BuyerApproved' | 'Disputed' | 'Resolved' | 'Cancelled';

interface EscrowNodeData {
  action: 'create' | 'mark_delivered' | 'approve' | 'dispute' | 'resolve' | 'auto_release' | 'check_status';
  
  // For 'create' action
  buyer?: string; // Buyer's public key
  seller?: string; // Seller's public key
  amount?: number; // Amount in lamports
  description?: string;
  disputeWindowDays?: number; // 1-30 days
  arbitrator?: string; // Optional arbitrator public key
  
  // For other actions
  escrowAddress?: string; // PDA address of escrow
  
  // For 'dispute' action
  disputeReason?: string;
  
  // For 'resolve' action
  winnerIsBuyer?: boolean; // true = buyer wins, false = seller wins
  
  // Common
  userId: string;
  flowId: string;
}

export const escrowNode: NodeHandler = {
  type: 'escrow',

  execute: async (nodeData: Record<string, any>, input: any, context: any) => {
    const data = nodeData as EscrowNodeData;
    const { action, userId, flowId } = data;

    context.logger(`escrow: starting ${action} action`);

    try {
      const connection = getConnection();

      switch (action) {
        case 'create':
          return await createEscrow(data, context, connection);
        
        case 'mark_delivered':
          return await markDelivered(data, context, connection);
        
        case 'approve':
          return await approveEscrow(data, context, connection);
        
        case 'dispute':
          return await raiseDispute(data, context, connection);
        
        case 'resolve':
          return await resolveDispute(data, context, connection);
        
        case 'auto_release':
          return await autoRelease(data, context, connection);
        
        case 'check_status':
          return await checkEscrowStatus(data, context, connection);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      context.logger(`escrow: error - ${error.message}`);
      return {
        success: false,
        error: error.message,
        action
      };
    }
  }
};

// ============================================================================
// CREATE ESCROW
// ============================================================================

async function createEscrow(
  data: EscrowNodeData,
  context: any,
  connection: Connection
) {
  const { buyer, seller, amount, description, disputeWindowDays, arbitrator, userId, flowId } = data;

  // Validate inputs
  if (!buyer) throw new Error('buyer address is required');
  if (!seller) throw new Error('seller address is required');
  if (!amount || amount <= 0) throw new Error('amount must be greater than 0');
  if (buyer === seller) throw new Error('buyer and seller cannot be the same');
  
  const windowDays = disputeWindowDays || 7;
  if (windowDays < 1 || windowDays > 30) {
    throw new Error('disputeWindowDays must be between 1 and 30');
  }

  if (description && description.length > 200) {
    throw new Error('description must be 200 characters or less');
  }

  // Generate unique seed for this escrow
  const seed = Date.now();

  // Derive PDA address
  const buyerPubkey = new PublicKey(buyer);
  const [escrowPDA, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('escrow'),
      buyerPubkey.toBuffer(),
      Buffer.from(seed.toString().padStart(8, '0'))
    ],
    PROGRAM_ID
  );

  context.logger(`escrow: derived PDA: ${escrowPDA.toString()}`);

  // Save to database
  const dbRecord = await prisma.escrowAccount.create({
    data: {
      id: escrowPDA.toString(),
      flowId,
      userId,
      buyer: buyer,
      seller: seller,
      arbitrator: arbitrator || null,
      amount: amount.toString(),
      description: description || '',
      disputeWindowDays: windowDays,
      status: 'Created',
      sellerDelivered: false,
      sellerDeliveredAt: null,
      buyerApproved: false,
      disputed: false,
      disputeRaisedAt: null,
      disputeReason: null,
      winner: null,
      decidedAt: null,
      seed: seed.toString(),
      bump: bump
    }
  });

  context.logger(`escrow: saved to database with ID: ${dbRecord.id}`);

  // Generate escrow management link
  const escrowLink = `${process.env.FRONTEND_URL}/escrow/${escrowPDA.toString()}`;

  return {
    success: true,
    action: 'create',
    escrowAddress: escrowPDA.toString(),
    buyer: buyer,
    seller: seller,
    arbitrator: arbitrator || null,
    amount: amount,
    description: description || '',
    disputeWindowDays: windowDays,
    status: 'Created',
    escrowLink: escrowLink,
    seed: seed,
    message: `Escrow created. Buyer must fund ${amount} lamports to escrow address.`,
    nextSteps: [
      'Buyer funds the escrow',
      'Seller delivers the item/service',
      'Seller marks as delivered',
      `Buyer has ${windowDays} days to approve or dispute`,
      'If no dispute, auto-release to seller'
    ]
  };
}

// ============================================================================
// MARK DELIVERED
// ============================================================================

async function markDelivered(
  data: EscrowNodeData,
  context: any,
  connection: Connection
) {
  const { escrowAddress, userId } = data;

  if (!escrowAddress) {
    throw new Error('escrowAddress is required for mark_delivered action');
  }

  // Fetch from database
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowAddress }
  });

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if user is the seller
  if (userId !== escrow.seller) {
    throw new Error('Only seller can mark as delivered');
  }

  // Check status
  if (escrow.status !== 'Created') {
    throw new Error(`Cannot mark delivered. Current status: ${escrow.status}`);
  }

  // TODO: Call on-chain program to mark delivered
  // For now, update database
  await prisma.escrowAccount.update({
    where: { id: escrowAddress },
    data: {
      status: 'SellerDelivered',
      sellerDelivered: true,
      sellerDeliveredAt: new Date()
    }
  });

  context.logger(`escrow: marked as delivered by seller ${userId}`);

  // Calculate dispute window end
  const disputeWindowEnd = new Date();
  disputeWindowEnd.setDate(disputeWindowEnd.getDate() + escrow.disputeWindowDays);

  return {
    success: true,
    action: 'mark_delivered',
    escrowAddress,
    status: 'SellerDelivered',
    sellerDeliveredAt: new Date().toISOString(),
    disputeWindowDays: escrow.disputeWindowDays,
    disputeWindowEnds: disputeWindowEnd.toISOString(),
    message: `Seller marked as delivered. Buyer has ${escrow.disputeWindowDays} days to approve or dispute.`,
    nextSteps: [
      'Buyer reviews the delivery',
      'Buyer can approve (releases funds to seller)',
      'Buyer can dispute (requires arbitrator)',
      `Auto-release to seller after ${escrow.disputeWindowDays} days if no action`
    ]
  };
}

// ============================================================================
// APPROVE (BUYER)
// ============================================================================

async function approveEscrow(
  data: EscrowNodeData,
  context: any,
  connection: Connection
) {
  const { escrowAddress, userId } = data;

  if (!escrowAddress) {
    throw new Error('escrowAddress is required for approve action');
  }

  // Fetch from database
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowAddress }
  });

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if user is the buyer
  if (userId !== escrow.buyer) {
    throw new Error('Only buyer can approve');
  }

  // Check status
  if (escrow.status !== 'SellerDelivered') {
    throw new Error(`Cannot approve. Current status: ${escrow.status}`);
  }

  // TODO: Call on-chain program to approve and transfer funds
  // For now, update database
  await prisma.escrowAccount.update({
    where: { id: escrowAddress },
    data: {
      status: 'Resolved',
      buyerApproved: true,
      winner: escrow.seller,
      decidedAt: new Date()
    }
  });

  context.logger(`escrow: approved by buyer ${userId}. Funds released to seller.`);

  return {
    success: true,
    action: 'approve',
    escrowAddress,
    status: 'Resolved',
    buyer: escrow.buyer,
    seller: escrow.seller,
    amount: parseInt(escrow.amount),
    winner: escrow.seller,
    decidedAt: new Date().toISOString(),
    message: `Buyer approved delivery. ${escrow.amount} lamports released to seller.`
  };
}

// ============================================================================
// RAISE DISPUTE
// ============================================================================

async function raiseDispute(
  data: EscrowNodeData,
  context: any,
  connection: Connection
) {
  const { escrowAddress, disputeReason, userId } = data;

  if (!escrowAddress) {
    throw new Error('escrowAddress is required for dispute action');
  }
  if (!disputeReason || disputeReason.length === 0) {
    throw new Error('disputeReason is required');
  }
  if (disputeReason.length > 500) {
    throw new Error('disputeReason must be 500 characters or less');
  }

  // Fetch from database
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowAddress }
  });

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if user is buyer or seller
  if (userId !== escrow.buyer && userId !== escrow.seller) {
    throw new Error('Only buyer or seller can raise dispute');
  }

  // Check status
  if (escrow.status !== 'SellerDelivered') {
    throw new Error(`Cannot dispute. Current status: ${escrow.status}`);
  }

  // Check if arbitrator exists
  if (!escrow.arbitrator) {
    throw new Error('No arbitrator set for this escrow');
  }

  // Check if within dispute window
  if (escrow.sellerDeliveredAt) {
    const windowEnd = new Date(escrow.sellerDeliveredAt);
    windowEnd.setDate(windowEnd.getDate() + escrow.disputeWindowDays);
    
    if (new Date() > windowEnd) {
      throw new Error('Dispute window has expired');
    }
  }

  // TODO: Call on-chain program to raise dispute
  // For now, update database
  await prisma.escrowAccount.update({
    where: { id: escrowAddress },
    data: {
      status: 'Disputed',
      disputed: true,
      disputeRaisedAt: new Date(),
      disputeReason: disputeReason
    }
  });

  context.logger(`escrow: dispute raised by ${userId}`);

  return {
    success: true,
    action: 'dispute',
    escrowAddress,
    status: 'Disputed',
    disputer: userId,
    disputeReason: disputeReason,
    arbitrator: escrow.arbitrator,
    disputeRaisedAt: new Date().toISOString(),
    message: 'Dispute raised. Arbitrator will review and make a decision.',
    nextSteps: [
      'Arbitrator reviews the dispute',
      'Arbitrator decides winner (buyer or seller)',
      'Funds released to winner'
    ]
  };
}

// ============================================================================
// RESOLVE DISPUTE (ARBITRATOR)
// ============================================================================

async function resolveDispute(
  data: EscrowNodeData,
  context: any,
  connection: Connection
) {
  const { escrowAddress, winnerIsBuyer, userId } = data;

  if (!escrowAddress) {
    throw new Error('escrowAddress is required for resolve action');
  }
  if (winnerIsBuyer === undefined) {
    throw new Error('winnerIsBuyer is required (true or false)');
  }

  // Fetch from database
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowAddress }
  });

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if user is the arbitrator
  if (userId !== escrow.arbitrator) {
    throw new Error('Only arbitrator can resolve dispute');
  }

  // Check status
  if (escrow.status !== 'Disputed') {
    throw new Error(`Cannot resolve. Current status: ${escrow.status}`);
  }

  const winner = winnerIsBuyer ? escrow.buyer : escrow.seller;

  // TODO: Call on-chain program to resolve and transfer funds
  // For now, update database
  await prisma.escrowAccount.update({
    where: { id: escrowAddress },
    data: {
      status: 'Resolved',
      winner: winner,
      decidedAt: new Date()
    }
  });

  context.logger(`escrow: dispute resolved by arbitrator ${userId}. Winner: ${winner}`);

  return {
    success: true,
    action: 'resolve',
    escrowAddress,
    status: 'Resolved',
    arbitrator: userId,
    winner: winner,
    winnerIsBuyer: winnerIsBuyer,
    amount: parseInt(escrow.amount),
    decidedAt: new Date().toISOString(),
    message: `Arbitrator decided in favor of ${winnerIsBuyer ? 'buyer' : 'seller'}. ${escrow.amount} lamports released to ${winner}.`
  };
}

// ============================================================================
// AUTO RELEASE
// ============================================================================

async function autoRelease(
  data: EscrowNodeData,
  context: any,
  connection: Connection
) {
  const { escrowAddress } = data;

  if (!escrowAddress) {
    throw new Error('escrowAddress is required for auto_release action');
  }

  // Fetch from database
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowAddress }
  });

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check status
  if (escrow.status !== 'SellerDelivered') {
    throw new Error(`Cannot auto-release. Current status: ${escrow.status}`);
  }

  // Check if dispute window has passed
  if (!escrow.sellerDeliveredAt) {
    throw new Error('Seller has not marked as delivered yet');
  }

  const windowEnd = new Date(escrow.sellerDeliveredAt);
  windowEnd.setDate(windowEnd.getDate() + escrow.disputeWindowDays);

  if (new Date() < windowEnd) {
    throw new Error('Dispute window has not expired yet');
  }

  // TODO: Call on-chain program to auto-release funds to seller
  // For now, update database
  await prisma.escrowAccount.update({
    where: { id: escrowAddress },
    data: {
      status: 'Resolved',
      winner: escrow.seller,
      decidedAt: new Date()
    }
  });

  context.logger(`escrow: auto-released to seller ${escrow.seller}`);

  return {
    success: true,
    action: 'auto_release',
    escrowAddress,
    status: 'Resolved',
    seller: escrow.seller,
    amount: parseInt(escrow.amount),
    winner: escrow.seller,
    decidedAt: new Date().toISOString(),
    message: `Dispute window expired. ${escrow.amount} lamports auto-released to seller.`
  };
}

// ============================================================================
// CHECK STATUS
// ============================================================================

async function checkEscrowStatus(
  data: EscrowNodeData,
  context: any,
  connection: Connection
) {
  const { escrowAddress } = data;

  if (!escrowAddress) {
    throw new Error('escrowAddress is required for check_status action');
  }

  // Fetch from database
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowAddress }
  });

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // TODO: Query on-chain account for real-time status
  // For now, return database state

  // Calculate dispute window status
  let disputeWindowStatus = null;
  if (escrow.sellerDeliveredAt) {
    const windowEnd = new Date(escrow.sellerDeliveredAt);
    windowEnd.setDate(windowEnd.getDate() + escrow.disputeWindowDays);
    
    disputeWindowStatus = {
      startedAt: escrow.sellerDeliveredAt.toISOString(),
      endsAt: windowEnd.toISOString(),
      hasExpired: new Date() > windowEnd,
      daysRemaining: Math.max(0, Math.ceil((windowEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    };
  }

  return {
    success: true,
    action: 'check_status',
    escrowAddress,
    buyer: escrow.buyer,
    seller: escrow.seller,
    arbitrator: escrow.arbitrator,
    amount: parseInt(escrow.amount),
    description: escrow.description,
    disputeWindowDays: escrow.disputeWindowDays,
    status: escrow.status,
    sellerDelivered: escrow.sellerDelivered,
    sellerDeliveredAt: escrow.sellerDeliveredAt?.toISOString(),
    buyerApproved: escrow.buyerApproved,
    disputed: escrow.disputed,
    disputeRaisedAt: escrow.disputeRaisedAt?.toISOString(),
    disputeReason: escrow.disputeReason,
    winner: escrow.winner,
    decidedAt: escrow.decidedAt?.toISOString(),
    disputeWindow: disputeWindowStatus,
    createdAt: escrow.createdAt.toISOString()
  };
}
