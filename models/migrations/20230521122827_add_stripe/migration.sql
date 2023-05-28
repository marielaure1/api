/*
  Warnings:

  - Added the required column `interval` to the `Plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripe_id` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscription` to the `Subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripe_id` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `plans` ADD COLUMN `interval` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `stripe_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `subscriptions` ADD COLUMN `subscription` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `stripe_id` INTEGER NOT NULL;
