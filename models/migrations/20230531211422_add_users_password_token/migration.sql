-- AlterTable
ALTER TABLE `users` ADD COLUMN `passwordResetToken` VARCHAR(191) NULL,
    ADD COLUMN `passwordResetTokenExpiration` VARCHAR(191) NULL;
