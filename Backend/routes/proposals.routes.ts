import { Router } from 'express';
import { PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { authMiddleware } from '../middlewares/auth.middleware';
import prisma from '../config/database';
import { getConnection } from '../config/web3';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import axios from 'axios';

const router = Router();

const PROGRAM_ID = new PublicKey('3cxwG4X6k67rmaJzChP4sUqq8CnqMmuN6uM6bHKLRPz1');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper to send telegram notification
async function sendTelegramNotification(chatId: string, message: string) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return;
    
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

// Helper to send email notification
async function sendEmailNotification(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

// ============ MULTISIG PROPOSAL ============

router.post('/multisig', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const {
      flowId,
      owners,
      threshold,
      description,
      expiresAt,
      creatorPubkey,
      notifyEmail,
      notifyTelegram,
    } = req.body;

    // Validation
    if (!flowId || !owners || !threshold || !description || !creatorPubkey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(owners) || owners.length < 2 || owners.length > 10) {
      return res.status(400).json({ error: 'Owners must be between 2 and 10' });
    }

    if (threshold < 1 || threshold > owners.length) {
      return res.status(400).json({ error: 'Invalid threshold' });
    }

    // Generate unique seed
    const seed = crypto.randomBytes(16).toString('hex');

    // Derive PDA address
    const [proposalPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('multisig'), Buffer.from(seed)],
      PROGRAM_ID
    );

    const proposalId = proposalPda.toBase58();

    // Create database record
    const proposal = await prisma.multisigProposal.create({
      data: {
        id: proposalId,
        flowId,
        userId,
        creator: creatorPubkey,
        owners,
        threshold,
        description,
        status: 'pending',
        approvals: [],
        rejections: [],
        executed: false,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        seed,
        bump,
        signingUrl: `${FRONTEND_URL}/sign/multisig/${proposalId}`,
        notifyEmail,
        notifyTelegram,
      },
    });

    // Send notifications
    if (notifyEmail) {
      const emailHtml = `
        <h2>New Multisig Proposal Created</h2>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Threshold:</strong> ${threshold} of ${owners.length} owners</p>
        <p><strong>Expires:</strong> ${proposal.expiresAt.toLocaleString()}</p>
        <br>
        <p><strong>Signing URL:</strong></p>
        <a href="${proposal.signingUrl}" style="display:inline-block;padding:10px 20px;background:#06b6d4;color:white;text-decoration:none;border-radius:5px;">
          View & Sign Proposal
        </a>
        <br><br>
        <p>Or copy this link: ${proposal.signingUrl}</p>
      `;
      await sendEmailNotification(notifyEmail, 'New Multisig Proposal', emailHtml);
    }

    if (notifyTelegram) {
      const telegramMsg = `
🔐 <b>New Multisig Proposal</b>

<b>Description:</b> ${description}
<b>Threshold:</b> ${threshold} of ${owners.length} owners
<b>Expires:</b> ${proposal.expiresAt.toLocaleString()}

<b>Signing URL:</b>
${proposal.signingUrl}
      `.trim();
      await sendTelegramNotification(notifyTelegram, telegramMsg);
    }

    res.json({
      success: true,
      proposal: {
        id: proposal.id,
        signingUrl: proposal.signingUrl,
        seed: proposal.seed,
        bump: proposal.bump,
      },
    });
  } catch (error) {
    console.error('Error creating multisig proposal:', error);
    res.status(500).json({ error: 'Failed to create multisig proposal' });
  }
});

// ============ VOTING PROPOSAL ============

router.post('/voting', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const {
      flowId,
      title,
      description,
      choices,
      allowedVoters,
      expiresAt,
      creatorPubkey,
      notifyEmail,
      notifyTelegram,
    } = req.body;

    // Validation
    if (!flowId || !title || !description || !choices || !creatorPubkey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(choices) || choices.length < 2 || choices.length > 10) {
      return res.status(400).json({ error: 'Choices must be between 2 and 10' });
    }

    // Generate unique seed
    const seed = crypto.randomBytes(16).toString('hex');

    // Derive PDA address
    const [proposalPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('voting'), Buffer.from(seed)],
      PROGRAM_ID
    );

    const proposalId = proposalPda.toBase58();

    // Create database record
    const proposal = await prisma.votingProposal.create({
      data: {
        id: proposalId,
        flowId,
        userId,
        creator: creatorPubkey,
        title,
        description,
        choices,
        voteCounts: new Array(choices.length).fill(0),
        allowedVoters: allowedVoters || [],
        voters: [],
        finalized: false,
        status: 'active',
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seed,
        bump,
        votingUrl: `${FRONTEND_URL}/vote/${proposalId}`,
        notifyEmail,
        notifyTelegram,
      },
    });

    // Send notifications
    if (notifyEmail) {
      const emailHtml = `
        <h2>New Voting Proposal Created</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Choices:</strong> ${choices.join(', ')}</p>
        <p><strong>Type:</strong> ${allowedVoters?.length ? 'Restricted' : 'Public'}</p>
        <p><strong>Expires:</strong> ${proposal.expiresAt.toLocaleString()}</p>
        <br>
        <p><strong>Voting URL:</strong></p>
        <a href="${proposal.votingUrl}" style="display:inline-block;padding:10px 20px;background:#0891b2;color:white;text-decoration:none;border-radius:5px;">
          Cast Your Vote
        </a>
        <br><br>
        <p>Or copy this link: ${proposal.votingUrl}</p>
      `;
      await sendEmailNotification(notifyEmail, `New Vote: ${title}`, emailHtml);
    }

    if (notifyTelegram) {
      const telegramMsg = `
🗳️ <b>New Voting Proposal</b>

<b>Title:</b> ${title}
<b>Description:</b> ${description}
<b>Choices:</b> ${choices.join(', ')}
<b>Type:</b> ${allowedVoters?.length ? 'Restricted' : 'Public'}
<b>Expires:</b> ${proposal.expiresAt.toLocaleString()}

<b>Voting URL:</b>
${proposal.votingUrl}
      `.trim();
      await sendTelegramNotification(notifyTelegram, telegramMsg);
    }

    res.json({
      success: true,
      proposal: {
        id: proposal.id,
        votingUrl: proposal.votingUrl,
        seed: proposal.seed,
        bump: proposal.bump,
      },
    });
  } catch (error) {
    console.error('Error creating voting proposal:', error);
    res.status(500).json({ error: 'Failed to create voting proposal' });
  }
});

// ============ ESCROW ACCOUNT ============

router.post('/escrow', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const {
      flowId,
      buyer,
      seller,
      arbitrator,
      amount,
      description,
      disputeWindowDays,
      creatorPubkey,
      notifyEmail,
      notifyTelegram,
    } = req.body;

    // Validation
    if (!flowId || !buyer || !seller || !amount || !description || !disputeWindowDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (disputeWindowDays < 1 || disputeWindowDays > 30) {
      return res.status(400).json({ error: 'Dispute window must be between 1 and 30 days' });
    }

    // Generate unique seed
    const seed = crypto.randomBytes(16).toString('hex');

    // Derive PDA address
    const [escrowPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), Buffer.from(seed)],
      PROGRAM_ID
    );

    const escrowId = escrowPda.toBase58();

    // Create database record
    const escrow = await prisma.escrowAccount.create({
      data: {
        id: escrowId,
        flowId,
        userId,
        buyer,
        seller,
        arbitrator,
        amount,
        description,
        disputeWindowDays,
        status: 'Created',
        sellerDelivered: false,
        buyerApproved: false,
        disputed: false,
        seed,
        bump,
        escrowUrl: `${FRONTEND_URL}/escrow/${escrowId}`,
        notifyEmail,
        notifyTelegram,
      },
    });

    // Send notifications
    if (notifyEmail) {
      const emailHtml = `
        <h2>New Escrow Account Created</h2>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Amount:</strong> ${(parseInt(amount) / 1e9).toFixed(4)} SOL</p>
        <p><strong>Buyer:</strong> ${buyer}</p>
        <p><strong>Seller:</strong> ${seller}</p>
        ${arbitrator ? `<p><strong>Arbitrator:</strong> ${arbitrator}</p>` : ''}
        <p><strong>Dispute Window:</strong> ${disputeWindowDays} days</p>
        <br>
        <p><strong>Escrow URL:</strong></p>
        <a href="${escrow.escrowUrl}" style="display:inline-block;padding:10px 20px;background:#0e7490;color:white;text-decoration:none;border-radius:5px;">
          View Escrow
        </a>
        <br><br>
        <p>Or copy this link: ${escrow.escrowUrl}</p>
      `;
      await sendEmailNotification(notifyEmail, 'New Escrow Created', emailHtml);
    }

    if (notifyTelegram) {
      const telegramMsg = `
🤝 <b>New Escrow Account</b>

<b>Description:</b> ${description}
<b>Amount:</b> ${(parseInt(amount) / 1e9).toFixed(4)} SOL
<b>Buyer:</b> ${buyer}
<b>Seller:</b> ${seller}
${arbitrator ? `<b>Arbitrator:</b> ${arbitrator}` : ''}
<b>Dispute Window:</b> ${disputeWindowDays} days

<b>Escrow URL:</b>
${escrow.escrowUrl}
      `.trim();
      await sendTelegramNotification(notifyTelegram, telegramMsg);
    }

    res.json({
      success: true,
      escrow: {
        id: escrow.id,
        escrowUrl: escrow.escrowUrl,
        seed: escrow.seed,
        bump: escrow.bump,
      },
    });
  } catch (error) {
    console.error('Error creating escrow account:', error);
    res.status(500).json({ error: 'Failed to create escrow account' });
  }
});

export default router;
