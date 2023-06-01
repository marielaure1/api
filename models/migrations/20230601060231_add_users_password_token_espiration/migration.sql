/*
  Warnings:

  - You are about to alter the column `passwordResetTokenExpiration` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `passwordResetTokenExpiration` INTEGER NULL;
