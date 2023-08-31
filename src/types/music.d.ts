import { FileType } from "@/src/types/file-type";
import { Prisma, PrismaClient } from "@prisma/client";

export namespace Music {
  export namespace DB {
    type IncludeParameter<Key extends Prisma.ModelName> = {
      album: {
        artists: {
          include: {
            artist: true;
          };
        };
        artwork: true;
        genre: true;
        tags: true;
        trackList: {
          include: {
            trackConnections: {
              orderBy: {
                trackNumber: "asc";
              };
              include: {
                track: true;
              };
            };
          };
        };
      };
      albumArtist: {
        album: true;
        artist: true;
      };
      artist: {
        albums: {
          include: {
            album: true;
          };
        };
        tracks: {
          include: {
            track: true;
          };
        };
      };
      artwork: {
        albums: true;
        functions: true;
        playlists: true;
        tracks: true;
      };
      audioSource: {
        track: true;
      };
      function: {
        artwork: true;
        tags: true;
      };
      genre: {
        albums: true;
        tracks: true;
      };
      playlist: {
        artwork: true;
        tags: true;
        trackList: {
          include: {
            trackConnections: {
              orderBy: {
                trackNumber: "asc";
              };
              include: {
                track: true;
              };
            };
          };
        };
      };
      tag: {
        albums: true;
        functions: true;
        playlists: true;
        tagType: true;
        tracks: true;
      };
      tagType: {
        tags: true;
      };
      track: {
        artists: {
          include: {
            artist: true;
          };
        };
        artwork: true;
        audioSource: true;
        genre: true;
        listConnections: {
          include: {
            trackList: {
              include: {
                album: true;
                playlist: true;
              };
            };
          };
        };
        tags: true;
      };
      trackArtist: {
        artist: true;
        track: true;
      };
      trackInList: {
        track: true;
        trackList: true;
      };
      trackList: {
        album: true;
        playlist: true;
        trackConnections: {
          orderBy: {
            trackNumber: "asc";
          };
          include: {
            track: true;
          };
        };
      };
    }[Uncapitalize<Key>];

    export type TableType<Key extends Prisma.ModelName> = NonNullable<
      Prisma.Result<
        PrismaClient[Uncapitalize<Key>],
        {
          include: IncludeParameter<Key>;
        },
        "findUnique"
      >
    >;

    export type TableTypes = {
      [Key in Prisma.ModelName]: TableType<Key>;
    };
  }
  export namespace Files {
    export type PreUploadFile = {
      audioData: AudioData;
    } & EditableFile;
    export type EditableFile = {
      metadata: EditableMetadata;
    };
    export type AudioData = {
      fileType: FileType.FileTypeResult;
      buffer: Uint8Array;
    };

    export type EditableMetadata = Omit<Song, "modifiedOn" | "createdOn"> & {
      artists: string[];
      featuring: string[];
    };
  }

  export type ActionType =
    | "play song"
    | "number"
    | "loop"
    | "end loop"
    | "condition"
    | "end condition";

  export type MediaType = "track" | "album" | "playlist";

  export type RepeatMode = "none" | "one" | "all";

  export type SongEndBehavior = "stop" | "play";

  export type AudioEvent = () => void;

  export type ActionStub = {
    type: ActionType;
    data: string;
  };
}
