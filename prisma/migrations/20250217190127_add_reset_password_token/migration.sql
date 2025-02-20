/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "AccountType";

-- CreateTable
CREATE TABLE "individual_users" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "verificationCode" TEXT,
    "resetPasswordToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "individual_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_users" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "dateOfIncorporation" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "verificationCode" TEXT,
    "resetPasswordToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "individual_users_phone_key" ON "individual_users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "individual_users_email_key" ON "individual_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_users_email_key" ON "corporate_users"("email");
