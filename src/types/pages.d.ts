export namespace Pages {
  export namespace Upload {
    export type FileUploadType = "file" | "url";
  }
  export type Location =
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
    | "file upload";

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