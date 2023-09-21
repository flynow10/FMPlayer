import { FileType } from "@/src/types/file-type";
import { ArtistType, Prisma, PrismaClient } from "@prisma/client";
import { Operation } from "@prisma/client/runtime/library";

export namespace Music {
  export namespace DB {
    export type PrismaArgs<
      T extends keyof Music.DB.TableTypes,
      O extends Operation
    > = Prisma.Args<PrismaClient[Uncapitalize<T>], O>;
    type IncludeParameter<Key extends TableName> = {
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
        albums: {
          include: {
            artists: {
              include: {
                artist: true;
              };
            };
            artwork: true;
          };
        };
        tracks: {
          include: {
            artists: {
              include: {
                artist: true;
              };
            };
            artwork: true;
          };
        };
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

    export type TableName = Exclude<Prisma.ModelName, "Session">;

    export type TableType<
      Key extends TableName,
      Include extends PrismaArgs<
        Key,
        "findUnique"
      >["include"] = IncludeParameter<Key>
    > = NonNullable<
      Prisma.Result<
        PrismaClient[Uncapitalize<Key>],
        {
          include: Include;
        },
        "findUnique"
      >
    >;

    export type TableTypes = {
      [Key in TableName]: TableType<Key>;
    };
  }
  export namespace Files {
    export type EditableFile = {
      metadata: NewTrackMetadata;
      audioData: AudioData;
    };
    export type AudioData = {
      fileType: FileType.FileTypeResult;
      buffer: Uint8Array;
    };

    export type NewTrackMetadata = {
      id: string;
      title: string;
      artists: {
        name: string;
        type: ArtistType;
      }[];
      albumId: string | null;
      artworkUrl: string | null;
      tags: (
        | {
            id: string;
          }
        | {
            name: string;
            description: string;
            tagTypeId: string;
          }
      )[];
      genre: string;
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
