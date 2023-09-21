import { MusicLibrary } from "@/src/music/library/music-library";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import MediaCard from "@/src/components/media-displays/MediaCard";
import { MediaCarousel } from "@/src/components/media-displays/MediaCarousel";
import { slugify } from "@/src/utils/string-utils";
import { Music } from "@/src/types/music";
import { DataState, useDatabase } from "@/src/hooks/use-database";

const groupBy = <T, K extends string | number | symbol>(
  arr: T[],
  key: (i: T) => K
) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

const units = {
  year: 24 * 36e5 * 365,
  month: (24 * 36e5 * 365) / 12,
  day: 24 * 36e5,
  hour: 36e5,
  minute: 6e4,
  second: 1e3,
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const getRelativeTime = (d1: number, d2?: number) => {
  d2 = d2 ?? Date.now();
  const elapsed = d1 - d2;

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const [unitName, value] of Object.entries(units)) {
    if (Math.abs(elapsed) > value || unitName == "second") {
      return rtf.format(
        Math.round(elapsed / value),
        unitName as keyof typeof units
      );
    }
  }
  return "less than a second ago";
};

// type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type Album = Music.DB.TableType<"Album">;
type Track = Music.DB.TableType<"Track">;

export default function RecentlyAddedList() {
  const [recent, loadedState] = useDatabase(
    async () => {
      const albums = await MusicLibrary.db.album.list();
      const tracks = await MusicLibrary.db.track.list();
      const albumsAndSongs: (
        | (Album & { type: "album" })
        | (Track & { type: "track" })
      )[] = [];
      albumsAndSongs.push(
        ...albums.map<Album & { type: "album" }>((a) => ({
          ...a,
          type: "album",
        }))
      );
      albumsAndSongs.push(
        ...tracks.map<Track & { type: "track" }>((a) => ({
          ...a,
          type: "track",
        }))
      );
      albumsAndSongs.sort((a, b) => {
        const aTime = new Date(a.createdOn).getTime();
        const bTime = new Date(b.createdOn).getTime();
        if (aTime > bTime) return -1;
        if (bTime > aTime) return 1;
        return 0;
      });
      return groupBy(
        albumsAndSongs
          .filter((media) => {
            if (media.type === "track") {
              return media.listConnections.every(
                (connection) => connection.trackList.album === null
              );
            }
            return true;
          })
          .map((media) => {
            const timeClass = getRelativeTime(
              new Date(media.createdOn).getTime()
            ).replace(
              /\w\S*/g,
              (txt) =>
                txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
            );
            return {
              ...media,
              timeClass,
            };
          }),
        (item) => item.timeClass
      );
    },
    {},
    ["Album", "Track"]
  );

  if (loadedState === DataState.Loading) {
    return <FullCover />;
  }

  return (
    <div className="p-10">
      {Object.entries(recent).map(([timeClass, mediaData]) => {
        return (
          <div className="flex flex-col mb-12" key={slugify(timeClass)}>
            <span className="text-xl pb-2">{timeClass}</span>
            <MediaCarousel>
              {mediaData.map((media) => (
                <MediaCard
                  key={media.id}
                  type={media.type}
                  data={media}
                  style="cover-card"
                />
              ))}
            </MediaCarousel>
          </div>
        );
      })}
    </div>
  );
}
