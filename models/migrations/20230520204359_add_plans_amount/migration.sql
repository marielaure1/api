/*
  Warnings:

  - Made the column `stripe_id` on table `plans` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `plans` MODIFY `stripe_id` VARCHAR(191) NOT NULL;
