-- DropForeignKey
ALTER TABLE `resumes` DROP FOREIGN KEY `resumes_category_id_fkey`;

-- DropIndex
DROP INDEX `resumes_category_id_fkey` ON `resumes`;

-- AlterTable
ALTER TABLE `resumes` MODIFY `category_id` INTEGER UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `job_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
