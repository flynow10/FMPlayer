import { UUID } from "@/src/components/utils/UUID";
import { ReactNode, useEffect, useState } from "react";
import Page from "@/src/components/layout/Page";
import { ChevronLeft } from "lucide-react";
import classNames from "classnames";
import { Pages } from "@/src/types/pages";
import ToastTest from "@/src/components/utils/ToastTest";
import AblyStatusSymbol from "@/src/components/utils/AblyStatusSymbol";

type MainProps = {
  onPlayMedia?: Pages.PlayByID;
  location: Pages.Location;
  searchString: string;
  isSearching: boolean;
};
const DEFAULT_PAGES: Record<Pages.Location, Pages.PageStore> = {
  Search: { type: "search results" },
  Albums: { type: "album list" },
  Songs: { type: "song list" },
  Playlists: { type: "playlist list" },
  Genres: { type: "genre list" },
  "Import Media": { type: "file search" },
  Artists: { type: "album display" }, // no page created yet
  "Edit Playlists": { type: "album display" }, // no page created yet
  "Recently Added": { type: "recent list" },
};

export default function Main(props: MainProps) {
  const [tabs, updateTabs] = useState<
    Record<Pages.Location, Pages.PageStore[]>
  >({
    Albums: [],
    Artists: [],
    "Edit Playlists": [],
    Genres: [],
    "Import Media": [],
    Playlists: [],
    "Recently Added": [],
    Search: [],
    Songs: [],
  });

  useEffect(() => {
    if (tabs[props.location].length === 0) {
      updateTabs((prev) => ({
        ...prev,
        [props.location]: [DEFAULT_PAGES[props.location]],
      }));
    }
  }, [props.location, tabs]);

  const pageTitle = props.isSearching
    ? "Search: " + props.searchString
    : props.location;

  const pageElements: ReactNode[] = [];

  const onNavigate = (
    location: Pages.Location,
    navigateType: Pages.NavigationType,
    pageData?: Pages.PageStore
  ) => {
    if (navigateType === "new") {
      if (!pageData) {
        throw new Error("Page Data missing from new page");
      }

      updateTabs({
        ...tabs,
        [location]: [...tabs[location], pageData],
      });
    }

    if (navigateType === "back") {
      if (tabs[location].length > 1) {
        updateTabs({
          ...tabs,
          [location]: [
            ...tabs[location].filter((_, i, arr) => i !== arr.length - 1),
          ],
        });
      }
    }
  };

  (Object.entries(tabs) as [Pages.Location, Pages.PageStore[]][]).forEach(
    ([location, pageList]) => {
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
            onNavigate={onNavigate.bind(null, location)}
            onPlayMedia={(id, type) => {
              props.onPlayMedia?.(id, type);
            }}
          />
        );
      });
    }
  );
  return (
    <div className="main overflow-clip flex flex-col">
      <div className="py-3 border-b-2 px-4">
        <div className="flex items-center w-full">
          <div className="flex items-center grow">
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
                onNavigate(props.location, "back");
              }}
            >
              <ChevronLeft />
            </button>
            <h3 className="text-2xl inline-block">{pageTitle}</h3>
          </div>
          <AblyStatusSymbol />
        </div>
        <div className="flex flex-row gap-2">
          <UUID />
          <ToastTest />
          <div>
            <button
              className="px-2 border-2 rounded-md"
              onClick={() =>
                onNavigate(props.location, "new", { type: "testing page" })
              }
            >
              Go To Testing Page
            </button>
          </div>
        </div>
      </div>
      {pageElements}
    </div>
  );
}
