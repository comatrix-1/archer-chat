/*
  Warnings:

  - You are about to drop the `Awards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Awards" DROP CONSTRAINT "Awards_resumeId_fkey";

-- DropTable
DROP TABLE "Awards";

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "description" TEXT NOT NULL DEFAULT '',
    "resumeId" TEXT NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
