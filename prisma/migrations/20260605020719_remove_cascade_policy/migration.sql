/*
  Warnings:

  - You are about to drop the column `display_name` on the `job_groups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `job_groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `job_groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `resume_likes` DROP FOREIGN KEY `resume_likes_resume_id_fkey`;

-- DropForeignKey
ALTER TABLE `resume_likes` DROP FOREIGN KEY `resume_likes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `resume_scraps` DROP FOREIGN KEY `resume_scraps_resume_id_fkey`;

-- DropForeignKey
ALTER TABLE `resume_scraps` DROP FOREIGN KEY `resume_scraps_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `resumes` DROP FOREIGN KEY `resumes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_auths` DROP FOREIGN KEY `user_auths_user_id_fkey`;

-- DropIndex
DROP INDEX `job_groups_display_name_key` ON `job_groups`;

-- DropIndex
DROP INDEX `refresh_tokens_user_id_fkey` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `resume_likes_resume_id_fkey` ON `resume_likes`;

-- DropIndex
DROP INDEX `resume_scraps_resume_id_fkey` ON `resume_scraps`;

-- DropIndex
DROP INDEX `resumes_user_id_fkey` ON `resumes`;

-- DropIndex
DROP INDEX `user_auths_user_id_fkey` ON `user_auths`;

-- AlterTable
ALTER TABLE `job_groups` DROP COLUMN `display_name`,
    ADD COLUMN `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `resumes` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_public` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `scrap_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    MODIFY `description` VARCHAR(1000) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `job_groups_name_key` ON `job_groups`(`name`);

-- AddForeignKey
ALTER TABLE `user_auths` ADD CONSTRAINT `user_auths_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_likes` ADD CONSTRAINT `resume_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_likes` ADD CONSTRAINT `resume_likes_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_scraps` ADD CONSTRAINT `resume_scraps_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_scraps` ADD CONSTRAINT `resume_scraps_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
