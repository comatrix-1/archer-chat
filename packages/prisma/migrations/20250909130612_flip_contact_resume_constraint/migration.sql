/*
  Warnings:

  - A unique constraint covering the columns `[resumeId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_contactId_fkey";

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "resumeId" TEXT NOT NULL DEFAULT 'cmeznt8z80002tk3ol0300m2g';

-- CreateIndex
CREATE UNIQUE INDEX "Contact_resumeId_key" ON "Contact"("resumeId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
