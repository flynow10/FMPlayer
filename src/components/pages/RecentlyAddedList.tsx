import { MyMusicLibrary } from "@/src/music/library/music-library";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { MediaCard } from "@/src/components/media-displays/MediaCard";
import { Pages } from "@/src/types/pages";
import { Album, Song } from "@prisma/client";

export type RecentlyAddedListProps = {
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
};

const groupBy = function <T extends Record<string, any>>(xs: T[], key: string) {
  return xs.reduce<Record<string, T[]>>(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

type AlbumWithType = Album & { type: "album" };
type SongWithType = Song & { type: "song" };

export default function RecentlyAddedList(props: RecentlyAddedListProps) {
  const [recent, loaded] = useAsyncLoad(
    async () => {
      const albums = await MyMusicLibrary.getAlbumList({
        sortBy: "createdOn",
        sortDirection: "asc",
        limit: 5,
      });
      const songs = await MyMusicLibrary.getSongList({
        sortBy: "createdOn",
        sortDirection: "asc",
      });
      const albumsAndSongs: (AlbumWithType | SongWithType)[] = [];
      albumsAndSongs.push(
        ...albums.map<AlbumWithType>((a) => ({ ...a, type: "album" }))
      );
      albumsAndSongs.push(
        ...songs.map<SongWithType>((a) => ({ ...a, type: "song" }))
      );
      albumsAndSongs.sort((a, b) => {
        const aTime = new Date(a.createdOn).getTime();
        const bTime = new Date(b.createdOn).getTime();
        if (aTime > bTime) return -1;
        if (bTime > aTime) return 1;
        return 0;
      });
      return groupBy(
        albumsAndSongs.map((media) => {
          let timeClass = "Unknown";
          const mediaTime = new Date(media.createdOn).getTime();
          const oneDay = 24 * 60 * 60 * 1000;
          const today = new Date(
            new Date().toISOString().substring(0, 10).toString()
          ).getTime();

          // yesterday
          if (mediaTime > today - oneDay) {
            timeClass = "Yesterday";
          }

          // today
          if (mediaTime > today) {
            timeClass = "Today";
          }

          // this week
          // last week
          // this month
          // last 3 months
          // last 6 months
          // this year
          // year {calculated}

          return {
            ...media,
            timeClass,
          };
        }),
        "timeClass"
      );
    },
    {},
    []
  );

  recent;

  if (!loaded) {
    return <FullCover />;
  }

  return (
    <div className="grid grid-cols-5 gap-x-8 overflow-auto p-10">
      {Object.entries(recent).map(([timeClass, mediaData]) => {
        return (
          <div key={timeClass}>
            <h1>{timeClass}</h1>
            {mediaData.map((media) => (
              <MediaCard
                key={media.id}
                id={media.id}
                title={media.title}
                size={"medium"}
                mediaType={media.type}
                onNavigate={props.onNavigate}
                onPlayMedia={props.onPlayMedia}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
