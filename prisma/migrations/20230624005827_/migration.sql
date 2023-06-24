-- AlterTable
ALTER TABLE "Album" ALTER COLUMN "artists" SET DEFAULT ARRAY['Unknown Artist']::VARCHAR(64)[],
ALTER COLUMN "featuring" SET DEFAULT ARRAY[]::VARCHAR(64)[];

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "audioUploaded" TIMESTAMP(3),
ALTER COLUMN "artists" SET DEFAULT ARRAY['Unknown Artist']::VARCHAR(64)[],
ALTER COLUMN "featuring" SET DEFAULT ARRAY[]::VARCHAR(64)[];
