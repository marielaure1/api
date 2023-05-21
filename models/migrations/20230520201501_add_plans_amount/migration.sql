/*
  Warnings:

  - You are about to drop the column `amopunt` on the `plans` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `plans` DROP COLUMN `amopunt`,
    ADD COLUMN `amount` DOUBLE NOT NULL;
