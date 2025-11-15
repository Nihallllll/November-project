/*
  Warnings:

  - The values [ANTHROPIC] on the enum `LLMProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LLMProvider_new" AS ENUM ('OPENAI', 'GOOGLE');
ALTER TABLE "AINodeConfig" ALTER COLUMN "provider" TYPE "LLMProvider_new" USING ("provider"::text::"LLMProvider_new");
ALTER TYPE "LLMProvider" RENAME TO "LLMProvider_old";
ALTER TYPE "LLMProvider_new" RENAME TO "LLMProvider";
DROP TYPE "public"."LLMProvider_old";
COMMIT;

-- AlterTable
ALTER TABLE "AIMemory" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '24 hours';
