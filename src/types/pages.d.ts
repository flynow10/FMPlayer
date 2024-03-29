import { MouseEvent } from "react";

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
    | "Functions"
    | "Settings";

  export type PageType =
    | "search results"
    | "album list"
    | "track list"
    | "playlist list"
    | "genre list"
    | "recent list"
    | "artist list"
    | "function list"
    | "file search"
    | "file upload"
    | "youtube upload"
    | "album display"
    | "playlist display"
    | "playlist editor"
    | "function display"
    | "function editor"
    | "testing page";

  export type NavigationType = "new" | "back";

  export type PlayByID = (id: string, type: Music.MediaType) => void;

  export type NavigationMethod = (
    navigateType: NavigationType,
    pageData?: PageStore
  ) => void;

  export type PageStore = {
    type: PageType;
    data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  export type PageContext = {
    navigate: NavigationMethod;
    location: Location;
    currentLocation: Location;
    data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    pageSlug: string;
  };

  export namespace MediaDisplay {
    export type CardStyle = "cover-card" | "tab-card";
    export type LimitedTableType = {
      album: Music.DB.TableType<
        "Album",
        {
          artists: {
            include: {
              artist: true;
            };
          };
          artwork: true;
        }
      >;
      track: Music.DB.TableType<
        "Track",
        {
          artists: {
            include: {
              artist: true;
            };
          };
          artwork: true;
        }
      >;
      playlist: Music.DB.TableType<
        "Playlist",
        {
          artwork: true;
        }
      >;
      artist: Music.DB.TableType<"Artist", object>;
      function: Music.DB.TableType<"Function", { artwork: true }>;
    };
    export type DisplayableMediaType =
      | "album"
      | "track"
      | "playlist"
      | "artist"
      | "function";
    export type MediaCardProps<T extends DisplayableMediaType> = {
      type: T;
      data: LimitedTableType[T];
      style: CardStyle;
      hideLinks?: boolean;
      shouldDisplayType?: boolean;
      onClickPhoto?: (event: MouseEvent) => void | null;
      onClickTitle?: (event: MouseEvent) => void;
      onClickSubText?: (event: MouseEvent) => void;
    };
  }
}
