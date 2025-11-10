-- AlterTable
ALTER TABLE "AIMemory" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '24 hours';

-- CreateTable
CREATE TABLE "HeliusWebhook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "heliusWebhookId" TEXT NOT NULL,
    "webhookURL" TEXT NOT NULL,
    "webhookType" TEXT NOT NULL,
    "transactionTypes" TEXT[],
    "accountAddresses" TEXT[],
    "credentialId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastTriggered" TIMESTAMP(3),

    CONSTRAINT "HeliusWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeliusWebhookEvent" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "signature" TEXT,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "eventData" JSONB NOT NULL,
    "runId" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeliusWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeliusWebhook_heliusWebhookId_key" ON "HeliusWebhook"("heliusWebhookId");

-- CreateIndex
CREATE INDEX "HeliusWebhook_userId_idx" ON "HeliusWebhook"("userId");

-- CreateIndex
CREATE INDEX "HeliusWebhook_flowId_idx" ON "HeliusWebhook"("flowId");

-- CreateIndex
CREATE INDEX "HeliusWebhook_heliusWebhookId_idx" ON "HeliusWebhook"("heliusWebhookId");

-- CreateIndex
CREATE INDEX "HeliusWebhook_isActive_idx" ON "HeliusWebhook"("isActive");

-- CreateIndex
CREATE INDEX "HeliusWebhookEvent_webhookId_idx" ON "HeliusWebhookEvent"("webhookId");

-- CreateIndex
CREATE INDEX "HeliusWebhookEvent_signature_idx" ON "HeliusWebhookEvent"("signature");

-- CreateIndex
CREATE INDEX "HeliusWebhookEvent_processed_idx" ON "HeliusWebhookEvent"("processed");

-- CreateIndex
CREATE INDEX "HeliusWebhookEvent_timestamp_idx" ON "HeliusWebhookEvent"("timestamp");

-- AddForeignKey
ALTER TABLE "HeliusWebhook" ADD CONSTRAINT "HeliusWebhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeliusWebhook" ADD CONSTRAINT "HeliusWebhook_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeliusWebhookEvent" ADD CONSTRAINT "HeliusWebhookEvent_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "HeliusWebhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeliusWebhookEvent" ADD CONSTRAINT "HeliusWebhookEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE SET NULL ON UPDATE CASCADE;
