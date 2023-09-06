import { MusicLibrary } from "@/src/music/library/music-library";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Blur } from "@/src/components/utils/loading-pages/Blur";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { useState } from "react";
import { Pages } from "@/src/types/pages";
import { Music } from "@/src/types/music";
import { DataState, useDatabase } from "@/src/hooks/use-database";

type SongListProps = {
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
};

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
];

export default function SongList(props: SongListProps) {
  const [sortBy, setSortBy] = useState<Column["prop"]>("title");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [trackList, loadedState] = useDatabase(
    async () => {
      return (await MusicLibrary.db.track.list()).sort((a, b) => {
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
    },
    [],
    ["Track"],
    [sortBy, sort]
  );

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
        <table className="text-left w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="p-1 border-b-2"></th>
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
            {trackList.map((track) => (
              <tr key={track.id}>
                <td
                  role="button"
                  className="p-2"
                  onClick={() => {
                    props.onPlayMedia(track.id, "track");
                  }}
                >
                  <Play />
                </td>
                {columns.map((column) => {
                  let value = track[column.prop];

                  if (value instanceof Date) {
                    value = value.toISOString();
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
                    <td className="p-1" key={column.name}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!loadedState && (
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
