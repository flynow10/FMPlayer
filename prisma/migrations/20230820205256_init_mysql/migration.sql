-- CreateTable
CREATE TABLE `Song` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `genre` VARCHAR(64) NOT NULL DEFAULT 'Unknown',
    `albumId` VARCHAR(36) NULL,
    `trackNumber` INTEGER NOT NULL DEFAULT 1,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `audioUploaded` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Artist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `Artist_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Album` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `genre` VARCHAR(64) NOT NULL DEFAULT 'Unknown',
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Playlist` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_artistsSong` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_artistsSong_AB_unique`(`A`, `B`),
    INDEX `_artistsSong_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_featuringSong` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_featuringSong_AB_unique`(`A`, `B`),
    INDEX `_featuringSong_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_artistsAlbum` (
    `A` VARCHAR(36) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_artistsAlbum_AB_unique`(`A`, `B`),
    INDEX `_artistsAlbum_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_featuringAlbum` (
    `A` VARCHAR(36) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_featuringAlbum_AB_unique`(`A`, `B`),
    INDEX `_featuringAlbum_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Song` ADD CONSTRAINT `Song_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `Album`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_artistsSong` ADD CONSTRAINT `_artistsSong_A_fkey` FOREIGN KEY (`A`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_artistsSong` ADD CONSTRAINT `_artistsSong_B_fkey` FOREIGN KEY (`B`) REFERENCES `Song`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_featuringSong` ADD CONSTRAINT `_featuringSong_A_fkey` FOREIGN KEY (`A`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_featuringSong` ADD CONSTRAINT `_featuringSong_B_fkey` FOREIGN KEY (`B`) REFERENCES `Song`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_artistsAlbum` ADD CONSTRAINT `_artistsAlbum_A_fkey` FOREIGN KEY (`A`) REFERENCES `Album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_artistsAlbum` ADD CONSTRAINT `_artistsAlbum_B_fkey` FOREIGN KEY (`B`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_featuringAlbum` ADD CONSTRAINT `_featuringAlbum_A_fkey` FOREIGN KEY (`A`) REFERENCES `Album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_featuringAlbum` ADD CONSTRAINT `_featuringAlbum_B_fkey` FOREIGN KEY (`B`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
