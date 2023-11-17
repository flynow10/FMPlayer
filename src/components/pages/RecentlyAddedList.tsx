import { MusicLibrary } from "@/src/music/library/music-library";
import { FullCover } from "@/src/components/utils/loading/FullCover";
import MediaCard from "@/src/components/media-displays/MediaCard";
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

type TimeClass =
  | number
  | "year"
  | "sixMonths"
  | "threeMonths"
  | "thisMonth"
  | "week"
  | "today";

const timeClassCutoffs = {
  year: 36e5 * 24 * 365,
  sixMonths: (36e5 * 24 * 365) / 2,
  threeMonths: (36e5 * 24 * 365) / 4,
  thisMonth: (36e5 * 24 * 365) / 12,
  week: 36e5 * 24 * 7,
  today: 36e5 * 24,
};

const timeClassNames: {
  [Key in TimeClass]: string;
} = {
  year: "This Year",
  sixMonths: "Last 6 Months",
  threeMonths: "Last 3 Months",
  thisMonth: "This Month",
  week: "This Week",
  today: "Today",
};

const getTimeClass = (d1: number, d2?: number): TimeClass => {
  d2 = d2 ?? Date.now();
  const elapsed = Math.abs(d1 - d2);
  if (elapsed >= timeClassCutoffs.year) {
    return new Date(d1).getFullYear();
  }
  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const [unitName, value] of Object.entries(timeClassCutoffs)) {
    if (Math.abs(elapsed) < value) {
      continue;
    } else {
      const keysArray = Object.keys(timeClassCutoffs) as TimeClass[];
      return keysArray[
        keysArray.indexOf(unitName as keyof typeof timeClassCutoffs) - 1
      ];
    }
  }
  return "today";
};

const getTimeClassSortValue = (timeClass: TimeClass) => {
  if (!isNaN(parseInt(timeClass as string))) {
    return parseInt(timeClass as string);
  }
  const ranking: { [key in TimeClass]: number } = {
    today: 0,
    week: 1,
    thisMonth: 2,
    threeMonths: 3,
    sixMonths: 4,
    year: 5,
  };
  return ranking[timeClass];
};

type Album = Music.DB.TableType<"Album">;
type Track = Music.DB.TableType<"Track">;

export default function RecentlyAddedList() {
  const [recent, loadedState] = useDatabase<
    Partial<
      Record<
        TimeClass,
        ((Album & { type: "album" }) | (Track & { type: "track" }))[]
      >
    >
  >(
    async () => {
      const albums = await MusicLibrary.db.album.list();
      const tracks = await MusicLibrary.db.track.list();
      const albumsAndTracks: (
        | (Album & { type: "album" })
        | (Track & { type: "track" })
      )[] = [];
      albumsAndTracks.push(
        ...albums.map<Album & { type: "album" }>((a) => ({
          ...a,
          type: "album",
        }))
      );
      albumsAndTracks.push(
        ...tracks.map<Track & { type: "track" }>((a) => ({
          ...a,
          type: "track",
        }))
      );
      albumsAndTracks.sort((a, b) => {
        return b.createdOn.getTime() - a.createdOn.getTime();
      });
      return groupBy(
        albumsAndTracks
          .filter((media) => {
            if (media.type === "track") {
              return media.listConnections.every(
                (connection) => connection.trackList.album === null
              );
            }
            return true;
          })
          .map((media) => {
            const timeClass = getTimeClass(new Date(media.createdOn).getTime());
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
    <div className="px-8">
      {Object.entries(recent)
        .sort(([a], [b]) => {
          return (
            getTimeClassSortValue(a as TimeClass) -
            getTimeClassSortValue(b as TimeClass)
          );
        })
        .map(([timeClass, mediaData], index) => {
          if (mediaData !== undefined) {
            return (
              <div className="flex flex-col relative" key={slugify(timeClass)}>
                {index !== 0 && <hr />}
                <span className="text-xl py-4 sticky top-0 z-10 bg-white font-bold mb-2">
                  {timeClass in timeClassNames
                    ? timeClassNames[timeClass as TimeClass]
                    : timeClass}
                </span>
                <div className="flex flex-row flex-wrap gap-y-8 gap-x-8 overflow-auto pb-10">
                  {mediaData.map((media) => (
                    <MediaCard
                      key={media.id}
                      type={media.type}
                      data={media}
                      style="cover-card"
                    />
                  ))}
                </div>
              </div>
            );
          }
        })}
    </div>
  );
}
