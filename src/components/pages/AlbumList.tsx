import { MusicLibrary } from "@/src/music/library/music-library";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { MediaCard } from "@/src/components/media-displays/MediaCard";
import { Pages } from "@/src/types/pages";
import { DataState, useDatabase } from "@/src/hooks/use-database";

type AlbumListProps = {
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
};

export default function AlbumList(props: AlbumListProps) {
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
    <div className="grid grid-cols-5 gap-x-8 overflow-auto p-10">
      {albumList.map((album) => (
        <MediaCard
          key={album.id}
          id={album.id}
          title={album.title}
          size={"medium"}
          mediaType={"album"}
          onNavigate={props.onNavigate}
          onPlayMedia={props.onPlayMedia}
        />
      ))}
    </div>
  );
}
