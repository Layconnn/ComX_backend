-- AlterTable
ALTER TABLE "corporate_users" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "picture" TEXT;

-- AlterTable
ALTER TABLE "individual_users" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "picture" TEXT;
