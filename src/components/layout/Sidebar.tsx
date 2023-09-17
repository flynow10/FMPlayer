import SuggestionSearch from "@/src/components/utils/input-extensions/SuggestionSearch";
import { Pages } from "@/src/types/pages";
import classNames from "classnames";
import {
  Clock3,
  Disc3,
  Drama,
  FolderInput,
  GalleryVerticalEnd,
  ListMusic,
  LucideIcon,
  Mic2,
  Pencil,
  Search,
} from "lucide-react";

type SidebarProps = {
  location: Pages.Location;
  isSearching: boolean;
  onSelectTab?: (location: Pages.Location) => void;
  onSearch?: (search: string) => void;
};
const libraryButtons: Pages.Location[] = [
  "Recently Added",
  "Artists",
  "Albums",
  "Songs",
  "Playlists",
  "Genres",
];

const managementButtons: Pages.Location[] = ["Import Media", "Edit Playlists"];

const disabled: Pages.Location[] = ["Playlists", "Edit Playlists", "Artists"];

const iconMap: { location: Pages.Location; icon: LucideIcon }[] = [
  { location: "Recently Added", icon: Clock3 },
  { location: "Artists", icon: Mic2 },
  { location: "Albums", icon: GalleryVerticalEnd },
  { location: "Songs", icon: Disc3 },
  { location: "Playlists", icon: ListMusic },
  { location: "Genres", icon: Drama },
  { location: "Import Media", icon: FolderInput },
  { location: "Edit Playlists", icon: Pencil },
];

export default function Sidebar(props: SidebarProps) {
  const createNavigationLink = (location: Pages.Location) => {
    const LucideIcon = iconMap.find(
      (locationIcon) => locationIcon.location === location
    )?.icon;
    return (
      <li key={location}>
        <button
          role="button"
          className={classNames(
            "text-lg",
            "block",
            "disabled:text-gray-400",
            "disabled:hover:bg-inherit",
            "hover:bg-gray-300",
            "rounded-lg",
            "my-1",
            "px-2",
            "py-1",
            "flex",
            "gap-1",
            {
              "bg-gray-300": location === props.location && !props.isSearching,
            }
          )}
          disabled={disabled.includes(location)}
          onClick={() => {
            props.onSelectTab?.(location);
          }}
        >
          {LucideIcon && (
            <LucideIcon size={20} className="my-auto text-accent dark:invert" />
          )}
          <span className="">{location}</span>
        </button>
      </li>
    );
  };

  return (
    <div className="sidebar flex flex-col border-r-2">
      <h3 className="text-4xl font-medium p-3 whitespace-nowrap overflow-clip">
        <img src="./icon.svg" className="dark:invert-0 inline mr-1 h-full" />
        FM Player
      </h3>
      <SuggestionSearch
        completions={[] as string[]}
        getCompletionValue={(s) => s}
        onCompletionFetchRequested={() => {
          return;
        }}
        onSubmit={(search) => {
          props.onSearch?.(search);
        }}
        outerContainerProps={{
          className: "mx-3 my-2",
        }}
        inputProps={{
          className:
            "rounded-md rounded-r-none border-2 border-r-0 px-2 py-1 w-full",
        }}
        searchButtonProps={{
          className: "py-1 px-2 rounded-md rounded-l-none border-2",
          buttonText: () => <Search />,
        }}
      />
      <div className="p-3 pl-5 flex flex-col flex-1 justify-between">
        <div>
          <h5 className="text-sm text-gray-400 font-bold">Library</h5>
          <ul className="mx-1">{libraryButtons.map(createNavigationLink)}</ul>
        </div>
        <div>
          <h5 className="text-sm text-gray-400 font-bold">Managment</h5>
          <ul className="mx-1">
            {managementButtons.map(createNavigationLink)}
          </ul>
        </div>
      </div>
    </div>
  );
}
