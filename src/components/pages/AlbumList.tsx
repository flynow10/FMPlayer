import { MusicLibrary } from "@/src/music/library/music-library";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import MediaCard from "@/src/components/media-displays/MediaCard";
import { DataState, useDatabase } from "@/src/hooks/use-database";

export default function AlbumList() {
  const [albumList, loadedState] = useDatabase(
    () => {
      return MusicLibrary.db.album.list();
    },
    [],
    ["Album"]
  );

  if (loadedState === DataState.Loading) {
    return <FullCover />;
  }

  return (
    <div className="flex flex-row flex-wrap gap-y-8 gap-x-8 overflow-auto p-8">
      {albumList.map((album) => (
        <MediaCard
          key={album.id}
          data={album}
          style="cover-card"
          type="album"
        />
      ))}
    </div>
  );
}
