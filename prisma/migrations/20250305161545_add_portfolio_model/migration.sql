-- CreateTable
CREATE TABLE "Portfolio" (
    "id" SERIAL NOT NULL,
    "individualUserId" INTEGER,
    "corporateUserId" INTEGER,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "todayChange" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_individualUserId_key" ON "Portfolio"("individualUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_corporateUserId_key" ON "Portfolio"("corporateUserId");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_individualUserId_fkey" FOREIGN KEY ("individualUserId") REFERENCES "individual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_corporateUserId_fkey" FOREIGN KEY ("corporateUserId") REFERENCES "corporate_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
