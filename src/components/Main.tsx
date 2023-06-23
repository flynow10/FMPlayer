import { MediaType } from "@/src/utils/types";
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

type PageStore = {
  type: PageType;
  data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default function Main(props: MainProps) {
  const [tabs, updateTabs] = useState(() => {
    const pagesObject: { [key: string]: PageStore[] } = {};
    pagesObject["Search"] = [{ type: PageType.SearchResults }];
    pagesObject[Location.Album] = [{ type: PageType.AlbumList }];
    pagesObject[Location.Song] = [{ type: PageType.SongList }];
    pagesObject[Location.Playlist] = [{ type: PageType.PlaylistList }];
    pagesObject[Location.Genre] = [{ type: PageType.GenreList }];
    pagesObject[Location.Import] = [{ type: PageType.FileSearch }];
    return pagesObject;
  });

  const pageTitle = props.isSearching
    ? "Search: " + props.searchString
    : props.location;

  const pageElements: ReactNode[] = [];

  const onNavigate = (navigateType: NavigationType, pageData?: PageStore) => {
    if (navigateType === NavigationType.New) {
      if (!pageData) {
        throw new Error("Page Data missing from new page");
      }
      updateTabs({
        ...tabs,
        [props.location]: [...tabs[props.location], pageData],
      });
    }
    if (navigateType === NavigationType.Back) {
      if (tabs[props.location].length > 1) {
        updateTabs({
          ...tabs,
          [props.location]: [
            ...tabs[props.location].filter((_, i, arr) => i !== arr.length - 1),
          ],
        });
      }
    }
  };

  Object.entries(tabs).forEach(([location, pageList]) => {
    pageList.forEach((page, index) => {
      pageElements.push(
        <Page
          index={index}
          location={location}
          type={page.type}
          data={page.data}
          locationPageCount={pageList.length}
          currentLocation={props.isSearching ? "Search" : props.location}
          key={location + index + page.type + JSON.stringify(page.data)}
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
                  tabs[props.location].length === 1,
              }
            )}
            disabled={tabs[props.location].length === 1}
            onClick={() => {
              onNavigate(NavigationType.Back);
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

export type PlayByID = (id: string, type: MediaType) => void;
export type NavigationMethod = (
  navigateType: NavigationType,
  pageData?: PageStore
) => void;
export enum NavigationType {
  New,
  Back,
}
