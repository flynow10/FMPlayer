/*
  Warnings:

  - You are about to drop the column `genre` on the `Album` table. All the data in the column will be lost.
  - The primary key for the `Artist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_artistsAlbum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_artistsSong` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_featuringAlbum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_featuringSong` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[trackListId]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackListId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `genreId` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackListId` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackListId` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Song` DROP FOREIGN KEY `Song_albumId_fkey`;

-- DropForeignKey
ALTER TABLE `_artistsAlbum` DROP FOREIGN KEY `_artistsAlbum_A_fkey`;

-- DropForeignKey
ALTER TABLE `_artistsAlbum` DROP FOREIGN KEY `_artistsAlbum_B_fkey`;

-- DropForeignKey
ALTER TABLE `_artistsSong` DROP FOREIGN KEY `_artistsSong_A_fkey`;

-- DropForeignKey
ALTER TABLE `_artistsSong` DROP FOREIGN KEY `_artistsSong_B_fkey`;

-- DropForeignKey
ALTER TABLE `_featuringAlbum` DROP FOREIGN KEY `_featuringAlbum_A_fkey`;

-- DropForeignKey
ALTER TABLE `_featuringAlbum` DROP FOREIGN KEY `_featuringAlbum_B_fkey`;

-- DropForeignKey
ALTER TABLE `_featuringSong` DROP FOREIGN KEY `_featuringSong_A_fkey`;

-- DropForeignKey
ALTER TABLE `_featuringSong` DROP FOREIGN KEY `_featuringSong_B_fkey`;

-- AlterTable
ALTER TABLE `Album` DROP COLUMN `genre`,
    ADD COLUMN `artworkId` VARCHAR(36) NULL,
    ADD COLUMN `genreId` VARCHAR(36) NOT NULL,
    ADD COLUMN `trackListId` VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `Artist` DROP PRIMARY KEY,
    ADD COLUMN `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `name` VARCHAR(256) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Playlist` ADD COLUMN `artworkId` VARCHAR(36) NULL,
    ADD COLUMN `trackListId` VARCHAR(36) NOT NULL;

-- DropTable
DROP TABLE `Song`;

-- DropTable
DROP TABLE `_artistsAlbum`;

-- DropTable
DROP TABLE `_artistsSong`;

-- DropTable
DROP TABLE `_featuringAlbum`;

-- DropTable
DROP TABLE `_featuringSong`;

-- CreateTable
CREATE TABLE `TagType` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `description` TEXT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TagType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `description` TEXT NULL,
    `tagTypeId` VARCHAR(36) NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Tag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Genre` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Genre_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Artwork` (
    `id` VARCHAR(36) NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Track` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `genreId` VARCHAR(36) NOT NULL,
    `artworkId` VARCHAR(36) NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrackArtist` (
    `trackId` VARCHAR(36) NOT NULL,
    `artistId` VARCHAR(36) NOT NULL,
    `artistType` ENUM('MAIN', 'FEATURED') NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`trackId`, `artistId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrackInList` (
    `trackId` VARCHAR(36) NOT NULL,
    `trackListId` VARCHAR(36) NOT NULL,
    `trackNumber` INTEGER NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`trackId`, `trackListId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AudioSource` (
    `trackId` VARCHAR(36) NOT NULL,
    `sourceType` ENUM('FILE', 'YOUTUBE') NOT NULL,
    `sourceId` VARCHAR(191) NULL,
    `durationMS` INTEGER NOT NULL,
    `integratedLoudness` DOUBLE NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`trackId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlbumArtist` (
    `albumId` VARCHAR(36) NOT NULL,
    `artistId` VARCHAR(36) NOT NULL,
    `artistType` ENUM('MAIN', 'FEATURED') NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`albumId`, `artistId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrackList` (
    `id` VARCHAR(36) NOT NULL,
    `integratedLoudness` DOUBLE NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Function` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `artworkId` VARCHAR(36) NULL,
    `functionData` JSON NOT NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TagToTrack` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_TagToTrack_AB_unique`(`A`, `B`),
    INDEX `_TagToTrack_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AlbumToTag` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_AlbumToTag_AB_unique`(`A`, `B`),
    INDEX `_AlbumToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FunctionToTag` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_FunctionToTag_AB_unique`(`A`, `B`),
    INDEX `_FunctionToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlaylistToTag` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_PlaylistToTag_AB_unique`(`A`, `B`),
    INDEX `_PlaylistToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Album_trackListId_key` ON `Album`(`trackListId`);

-- CreateIndex
CREATE UNIQUE INDEX `Playlist_trackListId_key` ON `Playlist`(`trackListId`);

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_tagTypeId_fkey` FOREIGN KEY (`tagTypeId`) REFERENCES `TagType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Track` ADD CONSTRAINT `Track_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `Genre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Track` ADD CONSTRAINT `Track_artworkId_fkey` FOREIGN KEY (`artworkId`) REFERENCES `Artwork`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackArtist` ADD CONSTRAINT `TrackArtist_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackArtist` ADD CONSTRAINT `TrackArtist_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `Artist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackInList` ADD CONSTRAINT `TrackInList_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackInList` ADD CONSTRAINT `TrackInList_trackListId_fkey` FOREIGN KEY (`trackListId`) REFERENCES `TrackList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AudioSource` ADD CONSTRAINT `AudioSource_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Album` ADD CONSTRAINT `Album_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `Genre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Album` ADD CONSTRAINT `Album_artworkId_fkey` FOREIGN KEY (`artworkId`) REFERENCES `Artwork`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Album` ADD CONSTRAINT `Album_trackListId_fkey` FOREIGN KEY (`trackListId`) REFERENCES `TrackList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlbumArtist` ADD CONSTRAINT `AlbumArtist_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `Album`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlbumArtist` ADD CONSTRAINT `AlbumArtist_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `Artist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Function` ADD CONSTRAINT `Function_artworkId_fkey` FOREIGN KEY (`artworkId`) REFERENCES `Artwork`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Playlist` ADD CONSTRAINT `Playlist_artworkId_fkey` FOREIGN KEY (`artworkId`) REFERENCES `Artwork`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Playlist` ADD CONSTRAINT `Playlist_trackListId_fkey` FOREIGN KEY (`trackListId`) REFERENCES `TrackList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TagToTrack` ADD CONSTRAINT `_TagToTrack_A_fkey` FOREIGN KEY (`A`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TagToTrack` ADD CONSTRAINT `_TagToTrack_B_fkey` FOREIGN KEY (`B`) REFERENCES `Track`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlbumToTag` ADD CONSTRAINT `_AlbumToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlbumToTag` ADD CONSTRAINT `_AlbumToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FunctionToTag` ADD CONSTRAINT `_FunctionToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Function`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FunctionToTag` ADD CONSTRAINT `_FunctionToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlaylistToTag` ADD CONSTRAINT `_PlaylistToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Playlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlaylistToTag` ADD CONSTRAINT `_PlaylistToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
