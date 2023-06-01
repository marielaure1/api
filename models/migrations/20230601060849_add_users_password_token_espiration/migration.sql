/*
  Warnings:

  - The `passwordResetTokenExpiration` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `passwordResetTokenExpiration`,
    ADD COLUMN `passwordResetTokenExpiration` DATETIME(3) NULL;
