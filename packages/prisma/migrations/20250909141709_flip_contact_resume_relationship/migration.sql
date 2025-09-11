/*
  Warnings:

  - You are about to drop the column `contactId` on the `Resume` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_contactId_fkey";

-- DropIndex
DROP INDEX "Resume_contactId_key";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "contactId";

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
