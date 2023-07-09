-- CreateTable
CREATE TABLE "Song" (
    "id" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "artists" VARCHAR(64)[] DEFAULT ARRAY['Unknown Artist']::VARCHAR(64)[],
    "featuring" VARCHAR(64)[] DEFAULT ARRAY[]::VARCHAR(64)[],
    "genre" VARCHAR(64) NOT NULL DEFAULT 'Unknown',
    "albumId" UUID,
    "trackNumber" INTEGER NOT NULL DEFAULT 1,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audioUploaded" TIMESTAMP(3),

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "artists" VARCHAR(64)[] DEFAULT ARRAY['Unknown Artist']::VARCHAR(64)[],
    "featuring" VARCHAR(64)[] DEFAULT ARRAY[]::VARCHAR(64)[],
    "genre" VARCHAR(64) NOT NULL DEFAULT 'Unknown',
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
