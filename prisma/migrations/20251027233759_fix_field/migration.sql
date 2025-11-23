/*
  Warnings:

  - The values [LOCAL,GOOGLE,MICROSOFT] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `updatedat` on the `Client` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('local', 'google', 'microsoft', 'facebook', 'twitter');
ALTER TABLE "User" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "AuthProvider_new" USING ("provider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "AuthProvider_old";
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'local';
COMMIT;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "updatedat",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'local';
