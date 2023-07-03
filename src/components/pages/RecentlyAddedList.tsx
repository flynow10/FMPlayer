import { MyMusicLibrary } from "@/src/music/library/music-library";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { MediaCard } from "@/src/components/media-displays/MediaCard";
import { Pages } from "@/src/types/pages";

export type RecentlyAddedListProps = {
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
};

export default function RecentlyAddedList(props: RecentlyAddedListProps) {
  const [recent, loaded] = useAsyncLoad(
    async () => {
      return { albums : await MyMusicLibrary.getAlbumList({sortBy : "createdOn", sortDirection : "asc", limit : 5}), songs : await MyMusicLibrary.getSongList({sortBy : "createdOn", sortDirection : "asc"})};
    },
    {albums: [], songs: []},
    []
  );

  if (!loaded) {
    return <FullCover />;
  }

  return (
    <div className="grid grid-cols-5 gap-x-8 overflow-auto p-10">
      <h1>Recent Albums</h1>
      <button onClick={() => {
        props.onNavigate("new", {type : "file search"})
      }}>Nav</button>
      {recent.albums.map((album) => (
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

<h1>Recent Songs</h1>
      {recent.songs.map((song) => (
        <MediaCard
          key={song.id}
          id={song.id}
          title={song.title}
          size={"medium"}
          mediaType={"song"}
          onNavigate={props.onNavigate}
          onPlayMedia={props.onPlayMedia}
        />
      ))}
    </div>
  );
}
