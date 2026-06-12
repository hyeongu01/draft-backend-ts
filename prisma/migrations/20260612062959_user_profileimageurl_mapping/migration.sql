/*
  Warnings:

  - You are about to drop the column `profileImageUrl` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `profileImageUrl`,
    ADD COLUMN `profile_image_url` VARCHAR(255) NULL;
