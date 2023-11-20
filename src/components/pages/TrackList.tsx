import { MusicLibrary } from "@/src/music/library/music-library";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Blur } from "@/src/components/utils/loading/Blur";
import { FullCover } from "@/src/components/utils/loading/FullCover";
import { useState } from "react";
import { Music } from "@/src/types/music";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { useMediaContext } from "@/src/hooks/use-media-context";

type Column = {
  name: string;
  prop: keyof Music.DB.TableType<"Track">;
  sortable: boolean;
};

const columns: Column[] = [
  {
    name: "Title",
    prop: "title",
    sortable: true,
  },
  {
    name: "Genre",
    prop: "genre",
    sortable: true,
  },
  {
    name: "Artist(s)",
    prop: "artists",
    sortable: false,
  },
  {
    name: "Date Modified",
    prop: "modifiedOn",
    sortable: true,
  },
  {
    name: "Date Added",
    prop: "createdOn",
    sortable: true,
  },
];

export default function TrackList() {
  const audioPlayer = useAudioPlayer();
  const { show: showTrackMenu } = useMediaContext("track");
  const [sortBy, setSortBy] = useState<Column["prop"]>("title");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [trackList, loadedState] = useDatabase(
    () => {
      return MusicLibrary.db.track.list();
    },
    [],
    ["Track"],
    []
  );

  const sortedTrackList = trackList.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sort == "desc") {
      [aValue, bValue] = [bValue, aValue];
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return aValue.getTime() - bValue.getTime();
    }
    return JSON.stringify(aValue).localeCompare(JSON.stringify(bValue));
  });

  const onSort = (prop: Column["prop"]) => {
    if (sortBy === prop) {
      setSort((value) => (value === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(prop);
      setSort("asc");
    }
  };

  if (trackList.length === 0 && loadedState === DataState.Loading) {
    return <FullCover />;
  }

  return (
    <>
      <div className="mx-8">
        <table className="table-fixed text-left w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="p-1 border-b-2 w-12"></th>
              {columns.map((column) => (
                <th
                  key={column.name}
                  className={
                    "p-1 border-b-2" + (column.sortable ? "" : " font-normal")
                  }
                >
                  {column.sortable ? (
                    <button onClick={() => onSort(column.prop)}>
                      {column.name}
                      {sortBy === column.prop &&
                        (sort === "desc" ? (
                          <ChevronDown className="inline" />
                        ) : (
                          <ChevronUp className="inline" />
                        ))}
                    </button>
                  ) : (
                    column.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="relative">
            {sortedTrackList.map((track) => (
              <tr
                key={track.id}
                onContextMenu={(event) => {
                  showTrackMenu({
                    event,
                    props: {
                      trackId: track.id,
                    },
                  });
                }}
              >
                <td
                  role="button"
                  className="p-2"
                  onClick={() => {
                    audioPlayer.play.track(track.id);
                  }}
                >
                  <Play />
                </td>
                {columns.map((column) => {
                  let value = track[column.prop];

                  if (value instanceof Date) {
                    if (value.getTime() + 24 * 60 * 60 * 1000 < Date.now()) {
                      value = value.toLocaleDateString();
                    } else {
                      value = value.toLocaleTimeString("en-us", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      });
                    }
                  }

                  if (column.prop === "artists") {
                    const artists = track[column.prop].filter(
                      (a) => a.artistType === "MAIN"
                    );
                    const featured = track[column.prop].filter(
                      (a) => a.artistType === "FEATURED"
                    );
                    value =
                      artists.map((a) => a.artist.name).join(", ") +
                      (featured.length > 0
                        ? " (feat. " +
                          featured.map((a) => a.artist.name).join(", ") +
                          ")"
                        : "");
                  }

                  if (Array.isArray(value)) {
                    value = value.join(", ");
                  }

                  if (value === null) {
                    value = "";
                  }

                  if (typeof value === "object") {
                    if ("name" in value) {
                      value = value.name ?? "";
                    } else {
                      value = "";
                    }
                  }

                  return (
                    <td
                      className="p-1 whitespace-nowrap overflow-hidden overflow-ellipsis"
                      key={column.name}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            {loadedState === DataState.Stale && (
              <tr className="h-full">
                <td colSpan={columns.length}>
                  <Blur />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
