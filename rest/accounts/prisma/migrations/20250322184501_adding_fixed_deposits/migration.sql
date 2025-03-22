/*
  Warnings:

  - You are about to alter the column `balance` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "balance" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "fixed_deposits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "interestRate" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "fixed_deposits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fixed_deposits" ADD CONSTRAINT "fixed_deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
