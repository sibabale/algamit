/*
  Warnings:

  - Added the required column `ownerName` to the `destinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "ownerName" TEXT NOT NULL;
