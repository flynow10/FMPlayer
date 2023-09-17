import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import classNames from "classnames";
import { Mic2, User2 } from "lucide-react";
import { ReactNode, useState } from "react";

type ArtistListProps = {
  onNavigate: Pages.NavigationMethod;
  onPlayMedia: Pages.PlayByID;
  artistId?: string;
};

export default function ArtistList(props: ArtistListProps) {
  const [artistId, setArtistId] = useState(props.artistId ?? "");
  const [artists, state] = useDatabase(
    async () => {
      const artists = await MusicLibrary.db.artist.list();
      return artists.sort((a, b) => a.name.localeCompare(b.name));
    },
    [],
    ["AlbumArtist", "Artist", "TrackArtist"]
  );
  if (state === DataState.Loading) {
    return <FullCover />;
  }
  return (
    <div className="flex h-full">
      <div className="flex flex-col border-r-2 shrink-0 max-w-1/5">
        {createArtistListItem(
          {
            albums: [],
            createdOn: new Date(),
            id: "",
            modifiedOn: new Date(),
            name: "All Artists",
            tracks: [],
          },
          <Mic2 className="shrink-0" />,
          artistId === "",
          () => {
            setArtistId("");
          }
        )}
        {artists.map((artist) =>
          createArtistListItem(
            artist,
            <User2 className="shrink-0" />,
            artist.id === artistId,
            () => {
              setArtistId(artist.id);
            }
          )
        )}
      </div>
    </div>
  );
}

function createArtistListItem(
  artist: Music.DB.TableType<"Artist">,
  icon: ReactNode,
  isSelected: boolean,
  onClick: () => void
) {
  return (
    <div key={artist.id} className="border-b-2">
      <button
        onClick={onClick}
        className={classNames(
          "p-4",
          "flex",
          "gap-2",
          "w-full",
          "whitespace-nowrap",
          {
            "bg-accent dark:invert": isSelected,
          }
        )}
      >
        {icon}
        <span className="overflow-hidden overflow-ellipsis">{artist.name}</span>
      </button>
    </div>
  );
}
