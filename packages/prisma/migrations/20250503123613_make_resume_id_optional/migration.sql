/*
  Warnings:

  - You are about to drop the column `profileId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `Education` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `HonorsAwards` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `LicenseCertification` table. All the data in the column will be lost.
  - You are about to drop the column `coverLetter` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `jobDescription` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `resume` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[resumeId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactId]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,conversationId]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactId` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Education" DROP CONSTRAINT "Education_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_profileId_fkey";

-- DropForeignKey
ALTER TABLE "HonorsAwards" DROP CONSTRAINT "HonorsAwards_profileId_fkey";

-- DropForeignKey
ALTER TABLE "LicenseCertification" DROP CONSTRAINT "LicenseCertification_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_profileId_fkey";

-- DropIndex
DROP INDEX "Conversation_profileId_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "profileId",
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "Education" DROP COLUMN "profileId",
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "profileId",
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "HonorsAwards" DROP COLUMN "profileId",
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "LicenseCertification" DROP COLUMN "profileId",
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "coverLetter",
DROP COLUMN "createdAt",
DROP COLUMN "jobDescription",
DROP COLUMN "resume",
DROP COLUMN "title",
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "conversationId" TEXT,
ADD COLUMN     "objective" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "profileId",
ADD COLUMN     "resumeId" TEXT;

-- DropTable
DROP TABLE "Profile";

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_resumeId_key" ON "Conversation"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_contactId_key" ON "Resume"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_conversationId_key" ON "Resume"("userId", "conversationId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseCertification" ADD CONSTRAINT "LicenseCertification_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HonorsAwards" ADD CONSTRAINT "HonorsAwards_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
