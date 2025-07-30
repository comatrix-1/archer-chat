/*
  Warnings:

  - The `status` column on the `Conversation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('OPEN', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'CLOSED', 'ACCEPTED');

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "status",
ADD COLUMN     "status" "JobApplicationStatus" NOT NULL DEFAULT 'OPEN';

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "jobLink" TEXT,
    "resume_path" TEXT,
    "cover_letter_path" TEXT,
    "salary" TEXT,
    "remarks" TEXT,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
