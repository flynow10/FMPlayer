import { MyMusicLibrary } from "@/src/Music/Library/MusicLibrary";
import { useAsyncLoad } from "@/src/utils/useAsyncLoad";
import { NavigationMethod, PlayByID } from "../Main";
import { MediaType } from "@/src/utils/types";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Blur, FullCover } from "./LoadingPages";
import { useState } from "react";
import { SongSortFields, SortType } from "api-lib/_postgres-types";
import { Song } from "@prisma/client";

export type SongListProps = {
  onPlayMedia: PlayByID;
  onNavigate: NavigationMethod;
};

type Column = {
  name: string;
} & (
  | {
      prop: SongSortFields;
      sortable: true;
    }
  | {
      prop: keyof Song;
      sortable: false;
    }
);

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
    sortable: true,
  },
];

export default function SongList(props: SongListProps) {
  const [sortBy, setSortBy] = useState<SongSortFields>("title");
  const [sort, setSort] = useState<SortType>("asc");
  const [songList, loaded] = useAsyncLoad(
    () => MyMusicLibrary.getSongList({ sortDirection: sort, sortBy }),
    [],
    [sortBy, sort]
  );
  const onSort = (prop: SongSortFields) => {
    if (sortBy === prop) {
      setSort((value) => (value === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(prop);
      setSort("asc");
    }
  };
  if (songList.length === 0 && !loaded) {
    return <FullCover />;
  }
  return (
    <>
      <div className="mx-8">
        <table className="text-left w-full border-separate border-spacing-0">
          <thead className="sticky top-0 bg-white">
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
            {songList.map((song) => (
              <tr key={song.id}>
                <td
                  role="button"
                  className="p-2"
                  onClick={() => {
                    props.onPlayMedia(song.id, MediaType.Song);
                  }}
                >
                  <Play />
                </td>
                {columns.map((column) => {
                  var value = song[column.prop];
                  if (value instanceof Date) {
                    value = value.toISOString();
                  }
                  if (value instanceof Array) {
                    value = value.join(", ");
                  }
                  return (
                    <td className="p-1" key={column.name}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!loaded && (
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
