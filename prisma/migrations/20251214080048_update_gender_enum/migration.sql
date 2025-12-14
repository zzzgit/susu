/*
  Warnings:

  - The `gender` column on the `customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('F', 'M');

-- AlterTable
ALTER TABLE "customer" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";
