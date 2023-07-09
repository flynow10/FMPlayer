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

const slugify = (...args: (string | number)[]): string => {
  const value = args.join(" ");

  return value
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, "-"); // separator
};

const units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const getRelativeTime = (d1: any, d2: any = new Date()) => {
  const elapsed = d1 - d2;

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u in units)
    if (Math.abs(elapsed) > units[u as keyof typeof units] || u == "second")
      return rtf.format(
        Math.round(elapsed / units[u as keyof typeof units]),
        u as keyof typeof units
      );
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
          const timeClass = getRelativeTime(
            new Date(media.createdOn),
            new Date()
          );
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
    <div className="grid grid-flow-row auto-rows-max gap-8 overflow-auto p-10">
      {Object.entries(recent).map(([timeClass, mediaData]) => {
        return (
          <div className="" key={slugify(timeClass)}>
            <h1 className="text-xl pb-2">{timeClass}</h1>
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
