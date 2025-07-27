/*
  Warnings:

  - Made the column `employmentType` on table `Experience` required. This step will fail if there are existing NULL values in that column.
  - Made the column `locationType` on table `Experience` required. This step will fail if there are existing NULL values in that column.
  - Made the column `proficiency` on table `Skill` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Skill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Experience" ALTER COLUMN "employmentType" SET NOT NULL,
ALTER COLUMN "locationType" SET NOT NULL;

-- AlterTable
ALTER TABLE "Skill" ALTER COLUMN "proficiency" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;
