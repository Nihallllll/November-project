/*
  Warnings:

  - The values [active,inactive,draft] on the enum `FlowStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [queued,running,completed,failed,cancelled] on the enum `RunStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ownerId` on the `Flow` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Flow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Run` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Run` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FlowStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
ALTER TABLE "public"."Flow" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Flow" ALTER COLUMN "status" TYPE "FlowStatus_new" USING ("status"::text::"FlowStatus_new");
ALTER TYPE "FlowStatus" RENAME TO "FlowStatus_old";
ALTER TYPE "FlowStatus_new" RENAME TO "FlowStatus";
DROP TYPE "public"."FlowStatus_old";
ALTER TABLE "Flow" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RunStatus_new" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
ALTER TABLE "public"."Run" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Run" ALTER COLUMN "status" TYPE "RunStatus_new" USING ("status"::text::"RunStatus_new");
ALTER TYPE "RunStatus" RENAME TO "RunStatus_old";
ALTER TYPE "RunStatus_new" RENAME TO "RunStatus";
DROP TYPE "public"."RunStatus_old";
ALTER TABLE "Run" ALTER COLUMN "status" SET DEFAULT 'QUEUED';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Flow" DROP CONSTRAINT "Flow_ownerId_fkey";

-- AlterTable
ALTER TABLE "Flow" DROP COLUMN "ownerId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Run" ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ExecutionLog" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CredentialToFlow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CredentialToFlow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ExecutionLog_runId_idx" ON "ExecutionLog"("runId");

-- CreateIndex
CREATE INDEX "ExecutionLog_timestamp_idx" ON "ExecutionLog"("timestamp");

-- CreateIndex
CREATE INDEX "ExecutionLog_level_idx" ON "ExecutionLog"("level");

-- CreateIndex
CREATE INDEX "_CredentialToFlow_B_index" ON "_CredentialToFlow"("B");

-- CreateIndex
CREATE INDEX "Flow_userId_idx" ON "Flow"("userId");

-- CreateIndex
CREATE INDEX "Flow_status_idx" ON "Flow"("status");

-- CreateIndex
CREATE INDEX "Flow_nextRunAt_idx" ON "Flow"("nextRunAt");

-- CreateIndex
CREATE INDEX "NodeOutput_runId_idx" ON "NodeOutput"("runId");

-- CreateIndex
CREATE INDEX "NodeOutput_runId_nodeId_idx" ON "NodeOutput"("runId", "nodeId");

-- CreateIndex
CREATE INDEX "Run_userId_idx" ON "Run"("userId");

-- CreateIndex
CREATE INDEX "Run_flowId_idx" ON "Run"("flowId");

-- CreateIndex
CREATE INDEX "Run_status_idx" ON "Run"("status");

-- CreateIndex
CREATE INDEX "Run_createdAt_idx" ON "Run"("createdAt");

-- AddForeignKey
ALTER TABLE "ExecutionLog" ADD CONSTRAINT "ExecutionLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialToFlow" ADD CONSTRAINT "_CredentialToFlow_A_fkey" FOREIGN KEY ("A") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialToFlow" ADD CONSTRAINT "_CredentialToFlow_B_fkey" FOREIGN KEY ("B") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
