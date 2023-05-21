/*
  Warnings:

  - You are about to drop the `_plantousers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `published` to the `Ingredients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `published` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collection_id` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `published` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_plantousers` DROP FOREIGN KEY `_PlanToUsers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_plantousers` DROP FOREIGN KEY `_PlanToUsers_B_fkey`;

-- AlterTable
ALTER TABLE `ingredients` ADD COLUMN `published` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `plan` ADD COLUMN `published` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `collection_id` INTEGER NOT NULL,
    ADD COLUMN `published` BOOLEAN NOT NULL,
    ADD COLUMN `stock` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_plantousers`;

-- CreateTable
CREATE TABLE `Collections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `published` BOOLEAN NOT NULL,
    `limite` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_collection_id_fkey` FOREIGN KEY (`collection_id`) REFERENCES `Collections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
