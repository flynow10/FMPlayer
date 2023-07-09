import { MyMusicLibrary } from "@/src/music/library/music-library";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { MediaCard } from "@/src/components/media-displays/MediaCard";
import { Pages } from "@/src/types/pages";

type AlbumListProps = {
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
};

export default function AlbumList(props: AlbumListProps) {
  const [albumList, loaded] = useAsyncLoad(
    () => {
      return MyMusicLibrary.getAlbumList();
    },
    [],
    []
  );

  if (!loaded) {
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
