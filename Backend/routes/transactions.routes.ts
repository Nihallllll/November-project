// src/api/routes/transaction.routes.ts
import { Router } from "express";
import prisma from "../config/database";
const router = Router();
router.get('/transaction/pending/:token', async (req, res) => {
  const { token } = req.params;
  
  const tx = await prisma.pendingTransaction.findUnique({
    where: { approvalToken: token },
  });
  
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  if (tx.expiresAt < new Date()) {
    return res.status(410).json({ error: 'Transaction expired' });
  }
  
  if (tx.status !== 'pending') {
    return res.status(400).json({ error: 'Transaction already processed' });
  }
  
  // Return transaction details (NOT the serialized transaction yet)
  res.json({
    id: tx.id,
    type: tx.type,
    details: tx.transactionDetails,
    expiresAt: tx.expiresAt,
  });
});

router.post('/transaction/approve/:token', async (req, res) => {
  const { token } = req.params;
  const { signature } = req.body; // Signed transaction signature
  
  const tx = await prisma.pendingTransaction.findUnique({
    where: { approvalToken: token },
  });
  
  if (!tx || tx.status !== 'pending' || tx.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid transaction' });
  }
  
  // Update transaction status
  await prisma.pendingTransaction.update({
    where: { id: tx.id },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      signature,
    },
  });
  
  res.json({ success: true, signature });
});

router.post('/transaction/reject/:token', async (req, res) => {
  const { token } = req.params;
  
  await prisma.pendingTransaction.update({
    where: { approvalToken: token },
    data: {
      status: 'rejected',
      rejectedAt: new Date(),
    },
  });
  
  res.json({ success: true });
});

// Endpoint to get serialized transaction (only after user confirms intent)
router.post('/transaction/prepare/:token', async (req, res) => {
  const { token } = req.params;
  
  const tx = await prisma.pendingTransaction.findUnique({
    where: { approvalToken: token },
  });
  
  if (!tx || tx.status !== 'pending' || tx.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid transaction' });
  }
  
  // Return serialized transaction for wallet to sign
  res.json({
    transaction: tx.serializedTransaction,
    details: tx.transactionDetails,
  });
});


export const transactionRoutes = router ;