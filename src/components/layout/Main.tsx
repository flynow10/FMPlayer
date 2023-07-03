import { UUID } from "@/src/components/utils/UUID";
import { ReactNode, useState } from "react";
import Page from "@/src/components/layout/Page";
import { ChevronLeft } from "lucide-react";
import classNames from "classnames";
import { Pages } from "@/src/types/pages";

export type MainProps = {
  onPlayMedia?: Pages.PlayByID;
  location: Pages.Location;
  searchString: string;
  isSearching: boolean;
};

export default function Main(props: MainProps) {
  const [tabs, updateTabs] = useState<
    Record<Pages.Location | "Search", Pages.PageStore[]>
  >({
    Search: [{ type: "search results" }],
    Albums: [{ type: "album list" }],
    Songs: [{ type: "song list" }],
    Playlists: [{ type: "playlist list" }],
    Genres: [{ type: "genre list" }],
    "Import Media": [{ type: "file search" }],
    Artists: [{ type: "album display" }], // no page created yet
    "Edit Playlists": [{ type: "album display" }], // no page created yet
    "Recently Added": [{ type: "recent list" }], 
  });

  const pageTitle = props.isSearching
    ? "Search: " + props.searchString
    : props.location;

  const pageElements: ReactNode[] = [];

  const onNavigate = (
    navigateType: Pages.NavigationType,
    pageData?: Pages.PageStore
  ) => {
    if (navigateType === "new") {
      if (!pageData) {
        throw new Error("Page Data missing from new page");
      }

      updateTabs({
        ...tabs,
        [props.location]: [...tabs[props.location], pageData],
      });
    }

    if (navigateType === "back") {
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
