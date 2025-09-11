/*
  Warnings:

  - The `description` column on the `Award` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Education` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Award" DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "Education" DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "description",
ADD COLUMN     "description" JSONB;
