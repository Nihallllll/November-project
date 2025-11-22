-- AlterTable
ALTER TABLE "AIMemory" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '24 hours';

-- AlterTable
ALTER TABLE "EscrowAccount" ADD COLUMN     "escrowUrl" TEXT,
ADD COLUMN     "notifyEmail" TEXT,
ADD COLUMN     "notifyTelegram" TEXT;

-- AlterTable
ALTER TABLE "MultisigProposal" ADD COLUMN     "notifyEmail" TEXT,
ADD COLUMN     "notifyTelegram" TEXT,
ADD COLUMN     "signingUrl" TEXT;

-- AlterTable
ALTER TABLE "VotingProposal" ADD COLUMN     "notifyEmail" TEXT,
ADD COLUMN     "notifyTelegram" TEXT,
ADD COLUMN     "votingUrl" TEXT;
