import MediaCard from "@/src/components/media-displays/MediaCard";
import FullCover from "@/src/components/utils/loading/FullCover";

import { usePageContext } from "@/src/contexts/PageContext";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";

export default function PlaylistList() {
  const pages = usePageContext();
  const [playlistList, loadedState] = useDatabase(
    () => {
      return MusicLibrary.db.playlist.list();
    },
    [],
    ["Playlist"]
  );

  if (loadedState === DataState.Loading) {
    return <FullCover />;
  }

  return (
    <div className="flex flex-col p-8 gap-4">
      <div className="flex flex-row">
        <div className="flex flex-col">
          <span className="text-xl">Your playlists</span>
        </div>
        <button
          onClick={() => {
            pages.navigate("new", {
              type: "playlist editor",
              data: { isNew: true, id: null },
            });
          }}
          className="btn accent ml-auto"
        >
          New Playlist
        </button>
      </div>
      <div className="flex flex-row flex-wrap gap-8 overflow-auto">
        {playlistList.length === 0 && (
          <span className="text">You have not created any playlists</span>
        )}
        {playlistList.map((playlist) => (
          <MediaCard
            key={playlist.id}
            data={playlist}
            style="cover-card"
            shouldDisplayType={true}
            type="playlist"
          />
        ))}
      </div>
    </div>
  );
}
