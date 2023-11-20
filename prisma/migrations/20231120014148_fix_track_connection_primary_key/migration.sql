/*
  Warnings:

  - The primary key for the `TrackInList` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `TrackInList` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`trackId`, `trackListId`, `trackNumber`);
