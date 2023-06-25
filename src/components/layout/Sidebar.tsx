import { Pages } from "@/src/types/pages";

export type SidebarProps = {
  location: Pages.Location;
  isSearching: boolean;
  onSelectTab?: (location: Pages.Location) => void;
  onSearch?: (search: string) => void;
};

export default function Sidebar(props: SidebarProps) {
  const notDisabled: Pages.Location[] = [
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
    <button
      role="button"
      className={
        "text-lg block disabled:text-gray-400 disabled:hover:bg-inherit hover:bg-gray-300 rounded-lg my-1 px-2" +
        (location === props.location && !props.isSearching
          ? " bg-gray-300"
          : "")
      }
      disabled={!notDisabled.includes(location)}
      key={location}
      onClick={() => {
        props.onSelectTab?.(location);
      }}
    >
      {location}
    </button>
  );
  return (
    <div className="sidebar flex flex-col border-r-2">
      <h3 className="text-4xl font-medium p-3 whitespace-nowrap overflow-clip">
        <img src="./icon.svg" className="inline mr-1 h-full" />
        FM Player
      </h3>
      <div className="p-3 flex flex-col flex-1">
        <input
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
        />
        <div>
          <h5 className="text-sm text-gray-400 font-bold">Library</h5>
          <div className="mx-2">{libraryButtons.map(createNavigationLink)}</div>
        </div>
        <div className="mt-auto">
          <h5 className="text-sm text-gray-400 font-bold">Managment</h5>
          <div className="mx-2">
            {managementButtons.map(createNavigationLink)}
          </div>
        </div>
      </div>
    </div>
  );
}
