-- DropForeignKey
ALTER TABLE `AlbumArtist` DROP FOREIGN KEY `AlbumArtist_albumId_fkey`;

-- DropForeignKey
ALTER TABLE `AlbumArtist` DROP FOREIGN KEY `AlbumArtist_artistId_fkey`;

-- DropForeignKey
ALTER TABLE `AudioSource` DROP FOREIGN KEY `AudioSource_trackId_fkey`;

-- DropForeignKey
ALTER TABLE `TrackArtist` DROP FOREIGN KEY `TrackArtist_artistId_fkey`;

-- DropForeignKey
ALTER TABLE `TrackArtist` DROP FOREIGN KEY `TrackArtist_trackId_fkey`;

-- DropForeignKey
ALTER TABLE `TrackInList` DROP FOREIGN KEY `TrackInList_trackId_fkey`;

-- DropForeignKey
ALTER TABLE `TrackInList` DROP FOREIGN KEY `TrackInList_trackListId_fkey`;

-- AddForeignKey
ALTER TABLE `TrackArtist` ADD CONSTRAINT `TrackArtist_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackArtist` ADD CONSTRAINT `TrackArtist_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackInList` ADD CONSTRAINT `TrackInList_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackInList` ADD CONSTRAINT `TrackInList_trackListId_fkey` FOREIGN KEY (`trackListId`) REFERENCES `TrackList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AudioSource` ADD CONSTRAINT `AudioSource_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlbumArtist` ADD CONSTRAINT `AlbumArtist_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `Album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlbumArtist` ADD CONSTRAINT `AlbumArtist_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
