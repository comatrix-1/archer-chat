/*
  Warnings:

  - You are about to drop the column `coverLetterPath` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `resumePath` on the `JobApplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "coverLetterPath",
DROP COLUMN "resumePath",
ADD COLUMN     "coverLetterId" TEXT,
ADD COLUMN     "resumeId" TEXT;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_coverLetterId_fkey" FOREIGN KEY ("coverLetterId") REFERENCES "CoverLetter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
