-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "fullName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "jobDescription" TEXT;
