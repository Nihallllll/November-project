-- AlterTable
ALTER TABLE "Flow" ADD COLUMN     "lastRunAt" TIMESTAMP(3),
ADD COLUMN     "nextRunAt" TIMESTAMP(3),
ADD COLUMN     "schedule" TEXT;
