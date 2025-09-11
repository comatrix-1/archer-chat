-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_resumeId_fkey";

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "resumeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resume" ALTER COLUMN "contactId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
