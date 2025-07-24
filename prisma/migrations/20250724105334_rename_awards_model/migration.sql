/*
  Warnings:

  - You are about to drop the `HonorsAwards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HonorsAwards" DROP CONSTRAINT "HonorsAwards_resumeId_fkey";

-- DropTable
DROP TABLE "HonorsAwards";

-- CreateTable
CREATE TABLE "Awards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "resumeId" TEXT NOT NULL,

    CONSTRAINT "Awards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Awards" ADD CONSTRAINT "Awards_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
