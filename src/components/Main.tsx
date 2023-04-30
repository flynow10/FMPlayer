import { ID, MediaType } from "@/Music/Types";
import { UUID } from "./UUID";
import { ReactNode, useState } from "react";
import Page, { PageType } from "./Page";
import { ChevronLeft } from "lucide-react";
import classNames from "classnames";

export type MainProps = {
  onPlayMedia?: PlayByID;
  location: Location;
  searchString: string;
  isSearching: boolean;
};

export enum Location {
  Recent = "Recently Added",
  Album = "Albums",
  Artist = "Artists",
  Song = "Songs",
  Playlist = "Playlists",
  Genre = "Genres",
  Import = "Import Media",
  EditPlaylist = "Edit Playlists",
}

export default function Main(props: MainProps) {
  const [pages, updatePages] = useState(() => {
    const pagesObject: { [key: string]: { type: PageType; data: string }[] } =
      {};
    pagesObject["Search"] = [{ type: PageType.SearchResults, data: "" }];
    pagesObject[Location.Album] = [{ type: PageType.AlbumList, data: "" }];
    pagesObject[Location.Song] = [{ type: PageType.SongList, data: "" }];
    pagesObject[Location.Playlist] = [
      { type: PageType.PlaylistList, data: "" },
    ];
    pagesObject[Location.Import] = [{ type: PageType.UploadMedia, data: "" }];
    return pagesObject;
  });

  const pageTitle = props.isSearching
    ? "Search: " + props.searchString
    : props.location;

  const pageElements: ReactNode[] = [];

  const onNavigate = (
    navigateType: NavigationType,
    pageType?: PageType,
    data: string = ""
  ) => {
    if (navigateType === "new") {
      if (!pageType) {
        throw new Error("Page Type missing from new page");
      }
      updatePages({
        ...pages,
        [props.location]: [...pages[props.location], { type: pageType, data }],
      });
    }
    if (navigateType === "back") {
      if (pages[props.location].length > 1) {
        updatePages({
          ...pages,
          [props.location]: [
            ...pages[props.location].filter(
              (_, i, arr) => i !== arr.length - 1
            ),
          ],
        });
      }
    }
  };

  Object.entries(pages).forEach(([location, pageList]) => {
    pageList.forEach((page, index) => {
      pageElements.push(
        <Page
          index={index}
          location={location}
          type={page.type}
          data={page.data}
          locationPageCount={pageList.length}
          currentLocation={props.isSearching ? "Search" : props.location}
          key={location + index + page.type + page.data}
          onNavigate={onNavigate}
          onPlayMedia={(id, type) => {
            props.onPlayMedia?.(id, type);
          }}
        />
      );
    });
  });
  return (
    <div className="main overflow-clip flex flex-col">
      <div className="py-3 border-b-2 px-4">
        <div className="flex items-center">
          <button
            className={classNames(
              "p-1",
              "mr-1",
              "align-middle",
              "hover:bg-gray-100",
              "rounded-lg",
              {
                "text-gray-500 hover:bg-inherit":
                  pages[props.location].length === 1,
              }
            )}
            disabled={pages[props.location].length === 1}
            onClick={() => {
              onNavigate("back");
            }}
          >
            <ChevronLeft />
          </button>
          <h3 className="text-2xl inline-block">{pageTitle}</h3>
        </div>
        <UUID />
      </div>
      {pageElements}
    </div>
  );
}

export type PlayByID = (id: ID, type: MediaType) => void;
export type NavigationMethod = (
  navigateType: NavigationType,
  page?: PageType,
  data?: string
) => void;
export type NavigationType = "new" | "back";
