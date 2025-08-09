/*
  Warnings:

  - You are about to drop the column `codeVerificationExiresAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "codeVerificationExiresAt",
ADD COLUMN     "codeVerificationExpiresAt" TIMESTAMP(3);
