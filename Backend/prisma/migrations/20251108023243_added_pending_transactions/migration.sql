-- CreateTable
CREATE TABLE "PendingTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flowRunId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serializedTransaction" TEXT NOT NULL,
    "transactionDetails" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "signature" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvalToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingTransaction_approvalToken_key" ON "PendingTransaction"("approvalToken");

-- CreateIndex
CREATE INDEX "PendingTransaction_userId_idx" ON "PendingTransaction"("userId");

-- CreateIndex
CREATE INDEX "PendingTransaction_approvalToken_idx" ON "PendingTransaction"("approvalToken");

-- CreateIndex
CREATE INDEX "PendingTransaction_status_idx" ON "PendingTransaction"("status");
