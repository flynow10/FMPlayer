import { Music } from "@/src/types/music";

type LinkedArtistListProps = {
  onClickArtist: (artistId: string) => void;
  artistList: Music.HelperDB.ArtistConnection[];
};

export default function LinkedArtistList(props: LinkedArtistListProps) {
  return props.artistList.map((artistConnection, index, arr) => (
    <>
      <a
        key={artistConnection.artist.id}
        className="cursor-pointer text-accent-muted dark:invert"
        onClick={() => {
          props.onClickArtist(artistConnection.artistId);
        }}
      >
        {artistConnection.artist.name}
      </a>
      <span>{index < arr.length - 1 ? ", " : ""}</span>
    </>
  ));
}
