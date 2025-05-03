/*
  Warnings:

  - Made the column `resumeId` on table `Education` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resumeId` on table `Experience` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resumeId` on table `HonorsAwards` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resumeId` on table `LicenseCertification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resumeId` on table `Skill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Education" ALTER COLUMN "resumeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Experience" ALTER COLUMN "resumeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "HonorsAwards" ALTER COLUMN "resumeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LicenseCertification" ALTER COLUMN "resumeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Skill" ALTER COLUMN "resumeId" SET NOT NULL;
