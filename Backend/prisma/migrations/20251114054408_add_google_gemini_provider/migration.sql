-- AlterEnum
ALTER TYPE "LLMProvider" ADD VALUE 'GOOGLE';

-- AlterTable
ALTER TABLE "AIMemory" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '24 hours';
