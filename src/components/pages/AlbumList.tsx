import { MyMusicLibrary } from "@/src/Music/Library/MusicLibrary";
import { Album } from "@prisma/client";
import { NavigationMethod, PlayByID } from "../Main";
import { MediaType } from "@/src/Music/Types";
import { Loader2, Play } from "lucide-react";
import { PageType } from "../Page";
import { useAsyncLoad } from "@/src/utils/useAsyncLoad";
import { FullCover } from "./LoadingPages";

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
      {albumList.map((album) =>
        createAlbumCard(album, props.onPlayMedia, props.onNavigate)
      )}
    </div>
  );
}

const createAlbumCard = (
  album: Album,
  onPlayMedia: PlayByID,
  onNavigate: NavigationMethod
) => {
  return (
    <div className="flex flex-col" role="button" key={album.id}>
      <div
        className="group relative aspect-square overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-2xl"
        onClick={() => {
          onPlayMedia(album.id, MediaType.Album);
        }}
      >
        <img
          src={
            /* album.coverUrl ? album.coverUrl :  */ "./square-placeholder.jpg"
          }
          className="w-full h-full group-hover:blur transition-[filter]"
        />
        <Play
          size={48}
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <a
        className="h-12 mt-1 overflow-ellipsis overflow-clip break-words hover:underline"
        role="link"
        onClick={() => {
          onNavigate("new", PageType.AlbumDisplay, album.id);
        }}
      >
        {album.title}
      </a>
    </div>
  );
};
