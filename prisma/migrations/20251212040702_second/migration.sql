/*
  Warnings:

  - You are about to alter the column `gender` on the `customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `customer` MODIFY `gender` BOOLEAN NULL;
