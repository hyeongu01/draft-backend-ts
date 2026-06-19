/*
  Warnings:

  - You are about to drop the column `updated_at` on the `chat_rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chat_rooms` DROP COLUMN `updated_at`,
    ADD COLUMN `last_message_snapshot` VARCHAR(255) NULL,
    ADD COLUMN `last_messaged_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
