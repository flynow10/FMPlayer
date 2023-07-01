import { Music } from "@/src/types/music";
import * as jsmediatags from "jsmediatags";
import { TagType } from "jsmediatags/types";

export const getTags = (data: Blob | Uint8Array) =>
  new Promise<TagType | null>((resolve) => {
    jsmediatags.read(data instanceof Blob ? data : new Blob([data]), {
      onSuccess: (tags) => {
        resolve(tags);
      },
      onError: (error) => {
        console.warn(error);
        resolve(null);
      },
    });
  });

export const pullMetadataFromTags = (
  tags: TagType
): Partial<Music.Files.EditableMetadata> => {
  const metadata: Partial<Music.Files.EditableMetadata> = {};

  if (tags.tags.title) {
    metadata.title = tags.tags.title;
  }

  if (tags.tags.genre) {
    metadata.genre = tags.tags.genre;
  }

  if (tags.tags.track) {
    const trackNumber: number = parseInt(tags.tags.track);
    metadata.trackNumber = trackNumber;
  }

  if (tags.tags.artist) {
    metadata.artists = [tags.tags.artist];
  }

  return metadata;
};
