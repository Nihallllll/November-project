-- AlterTable
ALTER TABLE "AIMemory" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '24 hours';

-- CreateTable
CREATE TABLE "MultisigProposal" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "owners" TEXT[],
    "threshold" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "approvals" TEXT[],
    "rejections" TEXT[],
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seed" TEXT NOT NULL,
    "bump" INTEGER NOT NULL,

    CONSTRAINT "MultisigProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingProposal" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "choices" TEXT[],
    "voteCounts" INTEGER[],
    "allowedVoters" TEXT[],
    "voters" TEXT[],
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "winnerIndex" INTEGER,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seed" TEXT NOT NULL,
    "bump" INTEGER NOT NULL,

    CONSTRAINT "VotingProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowAccount" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "seller" TEXT NOT NULL,
    "arbitrator" TEXT,
    "amount" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "disputeWindowDays" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "sellerDelivered" BOOLEAN NOT NULL DEFAULT false,
    "sellerDeliveredAt" TIMESTAMP(3),
    "buyerApproved" BOOLEAN NOT NULL DEFAULT false,
    "disputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeRaisedAt" TIMESTAMP(3),
    "disputeReason" TEXT,
    "winner" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seed" TEXT NOT NULL,
    "bump" INTEGER NOT NULL,

    CONSTRAINT "EscrowAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MultisigProposal_flowId_idx" ON "MultisigProposal"("flowId");

-- CreateIndex
CREATE INDEX "MultisigProposal_userId_idx" ON "MultisigProposal"("userId");

-- CreateIndex
CREATE INDEX "MultisigProposal_status_idx" ON "MultisigProposal"("status");

-- CreateIndex
CREATE INDEX "MultisigProposal_executed_idx" ON "MultisigProposal"("executed");

-- CreateIndex
CREATE INDEX "MultisigProposal_expiresAt_idx" ON "MultisigProposal"("expiresAt");

-- CreateIndex
CREATE INDEX "VotingProposal_flowId_idx" ON "VotingProposal"("flowId");

-- CreateIndex
CREATE INDEX "VotingProposal_userId_idx" ON "VotingProposal"("userId");

-- CreateIndex
CREATE INDEX "VotingProposal_status_idx" ON "VotingProposal"("status");

-- CreateIndex
CREATE INDEX "VotingProposal_finalized_idx" ON "VotingProposal"("finalized");

-- CreateIndex
CREATE INDEX "VotingProposal_expiresAt_idx" ON "VotingProposal"("expiresAt");

-- CreateIndex
CREATE INDEX "EscrowAccount_flowId_idx" ON "EscrowAccount"("flowId");

-- CreateIndex
CREATE INDEX "EscrowAccount_userId_idx" ON "EscrowAccount"("userId");

-- CreateIndex
CREATE INDEX "EscrowAccount_status_idx" ON "EscrowAccount"("status");

-- CreateIndex
CREATE INDEX "EscrowAccount_disputed_idx" ON "EscrowAccount"("disputed");

-- CreateIndex
CREATE INDEX "EscrowAccount_buyer_idx" ON "EscrowAccount"("buyer");

-- CreateIndex
CREATE INDEX "EscrowAccount_seller_idx" ON "EscrowAccount"("seller");

-- AddForeignKey
ALTER TABLE "MultisigProposal" ADD CONSTRAINT "MultisigProposal_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultisigProposal" ADD CONSTRAINT "MultisigProposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingProposal" ADD CONSTRAINT "VotingProposal_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingProposal" ADD CONSTRAINT "VotingProposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowAccount" ADD CONSTRAINT "EscrowAccount_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowAccount" ADD CONSTRAINT "EscrowAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
