import { MyMusicLibrary } from "@/src/Music/Library/MusicLibrary";
import { useAsyncLoad } from "@/src/utils/useAsyncLoad";
import { NavigationMethod, PlayByID } from "../Main";
import { MediaType } from "@/src/Music/Types";
import { Play } from "lucide-react";
import LoadingPage from "./LoadingPage";
import { Fragment, useState } from "react";
import { SongSortFields, SortType } from "api/_postgres-types";

export type SongListProps = {
  onPlayMedia: PlayByID;
  onNavigate: NavigationMethod;
};

export default function SongList(props: SongListProps) {
  const [sortBy, setSortBy] = useState<SongSortFields>("artists");
  const [sort, setSort] = useState<SortType>("desc");
  const [songList, loaded] = useAsyncLoad(
    () => MyMusicLibrary.getSongList({ sort, sortBy }),
    [],
    [sortBy, sort]
  );
  if (!loaded) {
    return <LoadingPage />;
  }
  return (
    <div className="mx-8">
      <table className="text-left w-full border-separate border-spacing-0">
        <thead className="sticky top-0 bg-white">
          <tr>
            <th className="p-1 border-b-2"></th>
            <th className="p-1 border-b-2">Title</th>
            <th className="p-1 border-b-2">Genre</th>
            <th className="p-1 border-b-2">Artist(s)</th>
          </tr>
        </thead>
        <tbody>
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
              <td className="p-1">{song.title}</td>
              <td className="p-1">{song.genre}</td>
              <td className="p-1">{song.artists.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
