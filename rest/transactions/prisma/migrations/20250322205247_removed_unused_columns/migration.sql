/*
  Warnings:

  - You are about to drop the column `accountBalance` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `accountCurrency` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `currency` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Currency" ADD VALUE 'ZAR';

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_destinationId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "accountBalance",
DROP COLUMN "accountCurrency",
ADD COLUMN     "currency" "Currency" NOT NULL,
ALTER COLUMN "destinationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
