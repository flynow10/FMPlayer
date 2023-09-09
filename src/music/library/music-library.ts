import { createCRUDModule, CRUDObjects } from "@/src/music/library/crud-module";
import {
  AudioMethods,
  createAudioMethods,
} from "@/src/music/library/audio-module";
import { Music } from "@/src/types/music";

export type MusicLibrary = {
  db: CRUDObjects;
  audio: AudioMethods;
  uploadNewTrack(
    metadata: Music.Files.NewTrackMetadata
  ): Promise<Music.DB.TableType<"Track"> | null>;
};

export const MusicLibrary: MusicLibrary = (function () {
  const crud = createCRUDModule();
  return {
    db: crud,
    audio: createAudioMethods(),
    uploadNewTrack(metadata) {
      return MusicLibrary.db.track.create({
        title: metadata.title,
        artists: {
          create: metadata.artists.map((a) => ({
            artist: {
              connectOrCreate: {
                create: {
                  name: a.name,
                },
                where: {
                  name: a.name,
                },
              },
            },
            artistType: a.type,
          })),
        },
        genre: {
          connectOrCreate: {
            create: {
              name: metadata.genre,
            },
            where: {
              name: metadata.genre,
            },
          },
        },
      });
    },
  };
})();
