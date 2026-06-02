-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(32) NOT NULL,
    `nickname` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_auths` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `provider` VARCHAR(20) NOT NULL,
    `provider_id` VARCHAR(255) NOT NULL,
    `user_id` CHAR(32) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_auths_provider_provider_id_key`(`provider`, `provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `device_id` CHAR(32) NULL,
    `token` CHAR(64) NOT NULL,
    `user_id` CHAR(32) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,

    UNIQUE INDEX `refresh_tokens_device_id_user_id_key`(`device_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_auths` ADD CONSTRAINT `user_auths_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
