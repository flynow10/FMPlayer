import { Music } from "@/src/types/music";

export namespace Pages {
  export namespace Upload {
    export type FileUploadType = "file" | "url";
    export type SetFileMetadataFunction = <
      T extends keyof Music.Files.EditableMetadata
    >(
      fileId: string,
      property: T,
      value: Music.Files.EditableMetadata[T]
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
    | "Songs"
    | "Playlists"
    | "Genres"
    | "Import Media"
    | "Edit Playlists";

  export type PageType =
    | "search results"
    | "album list"
    | "song list"
    | "playlist list"
    | "album display"
    | "file search"
    | "genre list"
    | "recent list"
    | "file upload"
    | "youtube upload"
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
