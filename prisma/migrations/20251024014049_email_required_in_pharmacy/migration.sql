/*
  Warnings:

  - Made the column `email` on table `Pharmacy` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pharmacy" ALTER COLUMN "email" SET NOT NULL;
