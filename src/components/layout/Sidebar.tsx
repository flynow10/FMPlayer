import SuggestionSearch from "@/src/components/utils/input-extensions/SuggestionSearch";
import { Pages } from "@/src/types/pages";
import { Search } from "lucide-react";

type SidebarProps = {
  location: Pages.Location;
  isSearching: boolean;
  onSelectTab?: (location: Pages.Location) => void;
  onSearch?: (search: string) => void;
};

export default function Sidebar(props: SidebarProps) {
  const notDisabled: Pages.Location[] = [
    "Recently Added",
    "Albums",
    "Songs",
    // Pages.Location.Playlist,
    "Import Media",
    "Genres",
  ];
  const libraryButtons: Pages.Location[] = [
    "Recently Added",
    "Artists",
    "Albums",
    "Songs",
    "Playlists",
    "Genres",
  ];

  const managementButtons: Pages.Location[] = [
    "Import Media",
    "Edit Playlists",
  ];

  const createNavigationLink = (location: Pages.Location) => (
    <li key={location}>
      <button
        role="button"
        className={
          "text-lg block disabled:text-gray-400 disabled:hover:bg-inherit hover:bg-gray-300 rounded-lg my-1 px-2" +
          (location === props.location && !props.isSearching
            ? " bg-gray-300"
            : "")
        }
        disabled={!notDisabled.includes(location)}
        onClick={() => {
          props.onSelectTab?.(location);
        }}
      >
        {location}
      </button>
    </li>
  );

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
      {/* <input
          placeholder="Search"
          className="border-2 rounded-md my-2 px-2"
          onFocus={(target) => {
            const value = target.currentTarget.value;

            if (value !== "") {
              props.onSearch?.(value);
            }
          }}
          onChange={(target) => {
            props.onSearch?.(target.currentTarget.value);
          }}
        /> */}
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
