import { Music } from "@/src/types/music";

export namespace Pages {
  export namespace Upload {
    export type FileUploadType = "file" | "url";
    export type SetFileMetadataFunction = <
      T extends keyof Music.Files.NewTrackMetadata
    >(
      fileId: string,
      property: T,
      value: Music.Files.NewTrackMetadata[T]
    ) => void;

    export type FileStatus = {
      id: string;
      status: "not queued" | "waiting" | "uploading" | "uploaded";
    };
  }

  export type Location =
    | "Search"
    | "Recently Added"
    | "Albums"
    | "Artists"
    | "Tracks"
    | "Playlists"
    | "Genres"
    | "Import Media"
    | "Edit Playlists";

  export type PageType =
    | "search results"
    | "album list"
    | "track list"
    | "playlist list"
    | "genre list"
    | "recent list"
    | "artist list"
    | "file search"
    | "file upload"
    | "youtube upload"
    | "album display"
    | "testing page";

  export type NavigationType = "new" | "back";

  export type MediaCardSize = "small" | "medium" | "large";

  export type PlayByID = (id: string, type: Music.MediaType) => void;

  export type NavigationMethod = (
    navigateType: NavigationType,
    pageData?: PageStore
  ) => void;

  export type PageStore = {
    type: PageType;
    data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}
