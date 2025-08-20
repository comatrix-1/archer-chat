/*
  Warnings:

  - You are about to drop the column `resumeId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `Resume` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- DropIndex
DROP INDEX "Conversation_resumeId_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "resumeId",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "conversationId";
