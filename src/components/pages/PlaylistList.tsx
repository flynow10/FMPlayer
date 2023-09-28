import MediaCard from "@/src/components/media-displays/MediaCard";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";

export default function PlaylistList() {
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
          {playlistList.length === 0 && (
            <span className="text">You have not created any playlists</span>
          )}
        </div>
        <button className="btn ml-auto bg-accent dark:invert active:bg-accent-highlighted">
          New Playlist
        </button>
      </div>
      <div className="flex flex-row flex-wrap gap-8 overflow-auto">
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
