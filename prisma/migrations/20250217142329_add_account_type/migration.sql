/*
  Warnings:

  - You are about to drop the `bookmarks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('RETAIL', 'SERVICE', 'MANUFACTURING');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "businessType" "BusinessType",
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "dateOfIncorporation" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "verificationCode" TEXT;

-- DropTable
DROP TABLE "bookmarks";
