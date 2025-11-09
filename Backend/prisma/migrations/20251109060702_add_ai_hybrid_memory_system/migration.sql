-- CreateEnum
CREATE TYPE "DBNodeMode" AS ENUM ('READ', 'WRITE', 'BOTH');

-- CreateEnum
CREATE TYPE "LLMProvider" AS ENUM ('ANTHROPIC', 'OPENAI');

-- CreateTable
CREATE TABLE "AINodeConfig" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "LLMProvider" NOT NULL,
    "credentialId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userGoal" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 4000,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "useUserDBForMemory" BOOLEAN NOT NULL DEFAULT false,
    "memoryTableName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AINodeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostgresDBNodeConfig" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "mode" "DBNodeMode" NOT NULL DEFAULT 'BOTH',
    "schema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostgresDBNodeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMemory" (
    "id" TEXT NOT NULL,
    "aiNodeId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "summary" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolExecutionLog" (
    "id" TEXT NOT NULL,
    "aiNodeId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "toolType" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AINodeConfig_userId_idx" ON "AINodeConfig"("userId");

-- CreateIndex
CREATE INDEX "AINodeConfig_flowId_idx" ON "AINodeConfig"("flowId");

-- CreateIndex
CREATE UNIQUE INDEX "AINodeConfig_flowId_nodeId_key" ON "AINodeConfig"("flowId", "nodeId");

-- CreateIndex
CREATE INDEX "PostgresDBNodeConfig_userId_idx" ON "PostgresDBNodeConfig"("userId");

-- CreateIndex
CREATE INDEX "PostgresDBNodeConfig_flowId_idx" ON "PostgresDBNodeConfig"("flowId");

-- CreateIndex
CREATE INDEX "PostgresDBNodeConfig_mode_idx" ON "PostgresDBNodeConfig"("mode");

-- CreateIndex
CREATE UNIQUE INDEX "PostgresDBNodeConfig_flowId_nodeId_key" ON "PostgresDBNodeConfig"("flowId", "nodeId");

-- CreateIndex
CREATE INDEX "AIMemory_aiNodeId_idx" ON "AIMemory"("aiNodeId");

-- CreateIndex
CREATE INDEX "AIMemory_flowId_idx" ON "AIMemory"("flowId");

-- CreateIndex
CREATE INDEX "AIMemory_userId_idx" ON "AIMemory"("userId");

-- CreateIndex
CREATE INDEX "AIMemory_runId_idx" ON "AIMemory"("runId");

-- CreateIndex
CREATE INDEX "AIMemory_createdAt_idx" ON "AIMemory"("createdAt");

-- CreateIndex
CREATE INDEX "AIMemory_expiresAt_idx" ON "AIMemory"("expiresAt");

-- CreateIndex
CREATE INDEX "ToolExecutionLog_aiNodeId_idx" ON "ToolExecutionLog"("aiNodeId");

-- CreateIndex
CREATE INDEX "ToolExecutionLog_runId_idx" ON "ToolExecutionLog"("runId");

-- CreateIndex
CREATE INDEX "ToolExecutionLog_toolName_idx" ON "ToolExecutionLog"("toolName");

-- CreateIndex
CREATE INDEX "ToolExecutionLog_success_idx" ON "ToolExecutionLog"("success");

-- CreateIndex
CREATE INDEX "ToolExecutionLog_timestamp_idx" ON "ToolExecutionLog"("timestamp");

-- AddForeignKey
ALTER TABLE "AINodeConfig" ADD CONSTRAINT "AINodeConfig_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AINodeConfig" ADD CONSTRAINT "AINodeConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AINodeConfig" ADD CONSTRAINT "AINodeConfig_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostgresDBNodeConfig" ADD CONSTRAINT "PostgresDBNodeConfig_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostgresDBNodeConfig" ADD CONSTRAINT "PostgresDBNodeConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostgresDBNodeConfig" ADD CONSTRAINT "PostgresDBNodeConfig_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMemory" ADD CONSTRAINT "AIMemory_aiNodeId_fkey" FOREIGN KEY ("aiNodeId") REFERENCES "AINodeConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMemory" ADD CONSTRAINT "AIMemory_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMemory" ADD CONSTRAINT "AIMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMemory" ADD CONSTRAINT "AIMemory_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolExecutionLog" ADD CONSTRAINT "ToolExecutionLog_aiNodeId_fkey" FOREIGN KEY ("aiNodeId") REFERENCES "AINodeConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolExecutionLog" ADD CONSTRAINT "ToolExecutionLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
