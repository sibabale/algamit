/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "fixed_deposits" DROP CONSTRAINT "fixed_deposits_userId_fkey";

-- DropTable
DROP TABLE "User";
