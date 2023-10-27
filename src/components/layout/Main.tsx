import { MutableRefObject, ReactNode, useEffect, useState } from "react";
import Page from "@/src/components/layout/Page";
import { ChevronLeft } from "lucide-react";
import classNames from "classnames";
import { Pages } from "@/src/types/pages";
import AblyStatusSymbol from "@/src/components/utils/AblyStatusSymbol";
import DebugToolbar from "@/src/components/utils/DebugToolbar";
import { getApplicationDebugConfig } from "@/config/app";
import QueuePanel from "@/src/components/layout/QueuePanel";

type MainProps = {
  location: Pages.Location;
  searchString: string;
  navigationRef: MutableRefObject<Pages.NavigationMethod | undefined>;
  queueOpen: boolean;
  onToggleQueue: () => void;
};
const DEFAULT_PAGES: Record<Pages.Location, Pages.PageStore> = {
  Search: { type: "search results" },
  Albums: { type: "album list" },
  Tracks: { type: "track list" },
  Playlists: { type: "playlist list" },
  Genres: { type: "genre list" },
  "Import Media": { type: "file search" },
  Artists: { type: "artist list" }, // no page created yet
  "Edit Playlists": { type: "album display" }, // no page created yet
  "Recently Added": { type: "recent list" },
};
const debug = getApplicationDebugConfig();

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
    Tracks: [],
  });

  useEffect(() => {
    if (tabs[props.location].length === 0) {
      updateTabs((prev) => ({
        ...prev,
        [props.location]: [DEFAULT_PAGES[props.location]],
      }));
    }
  }, [props.location, tabs]);

  // Reset Search Location on search

  useEffect(() => {
    if (props.searchString !== "") {
      updateTabs((prev) => ({
        ...prev,
        Search: [DEFAULT_PAGES.Search],
      }));
    }
  }, [props.searchString]);

  const pageTitle = props.location;

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
  props.navigationRef.current = onNavigate.bind(null, props.location);

  (Object.entries(tabs) as [Pages.Location, Pages.PageStore[]][]).forEach(
    ([location, pageList]) => {
      pageList.forEach((page, index) => {
        pageElements.push(
          <Page
            index={index}
            location={location}
            type={page.type}
            data={
              page.type === "search results" ? props.searchString : page.data
            }
            locationPageCount={pageList.length}
            currentLocation={props.location}
            key={location + index + page.type + JSON.stringify(page.data)}
            onNavigate={onNavigate.bind(null, location)}
          />
        );
      });
    }
  );
  return (
    <div className="main relative overflow-clip flex flex-col">
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
        {debug && debug.showDebugToolBar && (
          <DebugToolbar
            onToggleQueue={() => {
              props.onToggleQueue();
            }}
            onNavigate={onNavigate}
            location={props.location}
          />
        )}
      </div>
      {pageElements}
      <QueuePanel open={props.queueOpen} />
    </div>
  );
}
