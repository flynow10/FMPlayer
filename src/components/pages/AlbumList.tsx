import { MyMusicLibrary } from "@/src/music/library/MusicLibrary";
import { NavigationMethod, PlayByID } from "@/src/components/layout/Main";
import { MediaType } from "@/src/utils/types";
import { useAsyncLoad } from "@/src/hooks/useAsyncLoad";
import { FullCover } from "@/src/components/pages/LoadingPages";
import {
  MediaCard,
  MediaCardSize,
} from "@/src/components/media-displays/MediaCard";

export type AlbumListProps = {
  onPlayMedia: PlayByID;
  onNavigate: NavigationMethod;
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
          size={MediaCardSize.Medium}
          mediaType={MediaType.Album}
          onNavigate={props.onNavigate}
          onPlayMedia={props.onPlayMedia}
        />
      ))}
    </div>
  );
}
