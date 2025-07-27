/*
  Warnings:

  - You are about to drop the column `name` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `objective` on the `Resume` table. All the data in the column will be lost.
  - Made the column `description` on table `Awards` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Awards" ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "name",
ADD COLUMN     "address" TEXT DEFAULT '',
ADD COLUMN     "fullName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "github" TEXT DEFAULT '',
ALTER COLUMN "linkedin" SET DEFAULT '',
ALTER COLUMN "portfolio" SET DEFAULT '',
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "objective",
ADD COLUMN     "summary" TEXT NOT NULL DEFAULT '';
