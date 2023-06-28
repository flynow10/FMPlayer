import { PostgresRequest } from "@/src/types/postgres-request";
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

export const pullMetaDataFromTags = (
  tags: TagType
): PostgresRequest.SongMetadata => {
  const metadata: PostgresRequest.SongMetadata = {
    title: tags.tags.title,
    genre: tags.tags.genre,
  };

  if (tags.tags.track) {
    const trackNumber: number = parseInt(tags.tags.track);
    metadata.trackNumber = trackNumber;
  }

  if (tags.tags.artist) {
    metadata.artists = [tags.tags.artist];
  }

  return metadata;
};
