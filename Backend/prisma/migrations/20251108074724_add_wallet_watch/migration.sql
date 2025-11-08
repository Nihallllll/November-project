-- CreateTable
CREATE TABLE "WalletWatch" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "watchType" TEXT NOT NULL,
    "lastBalance" BIGINT,
    "lastTokenBalance" BIGINT,
    "lastSignature" TEXT,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletWatch_flowId_idx" ON "WalletWatch"("flowId");

-- CreateIndex
CREATE INDEX "WalletWatch_walletAddress_idx" ON "WalletWatch"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "WalletWatch_flowId_nodeId_walletAddress_key" ON "WalletWatch"("flowId", "nodeId", "walletAddress");
