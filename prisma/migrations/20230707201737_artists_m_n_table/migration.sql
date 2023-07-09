/*
  Warnings:

  - You are about to drop the column `artists` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `featuring` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `artists` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `featuring` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "artists",
DROP COLUMN "featuring";

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "artists",
DROP COLUMN "featuring";

-- CreateTable
CREATE TABLE "Artist" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_artistsSong" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_featuringSong" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_artistsAlbum" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_featuringAlbum" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_artistsSong_AB_unique" ON "_artistsSong"("A", "B");

-- CreateIndex
CREATE INDEX "_artistsSong_B_index" ON "_artistsSong"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_featuringSong_AB_unique" ON "_featuringSong"("A", "B");

-- CreateIndex
CREATE INDEX "_featuringSong_B_index" ON "_featuringSong"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_artistsAlbum_AB_unique" ON "_artistsAlbum"("A", "B");

-- CreateIndex
CREATE INDEX "_artistsAlbum_B_index" ON "_artistsAlbum"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_featuringAlbum_AB_unique" ON "_featuringAlbum"("A", "B");

-- CreateIndex
CREATE INDEX "_featuringAlbum_B_index" ON "_featuringAlbum"("B");

-- AddForeignKey
ALTER TABLE "_artistsSong" ADD CONSTRAINT "_artistsSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_artistsSong" ADD CONSTRAINT "_artistsSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_featuringSong" ADD CONSTRAINT "_featuringSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_featuringSong" ADD CONSTRAINT "_featuringSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_artistsAlbum" ADD CONSTRAINT "_artistsAlbum_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_artistsAlbum" ADD CONSTRAINT "_artistsAlbum_B_fkey" FOREIGN KEY ("B") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_featuringAlbum" ADD CONSTRAINT "_featuringAlbum_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_featuringAlbum" ADD CONSTRAINT "_featuringAlbum_B_fkey" FOREIGN KEY ("B") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
