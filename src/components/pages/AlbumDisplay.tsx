import { FullCover } from "@/src/components/utils/loading/FullCover";
import { useDatabase, DataState } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { CircleEllipsis, Play } from "lucide-react";
import { Blur } from "@/src/components/utils/loading/Blur";
import OrderedTrackList from "@/src/components/media-displays/OrderedTrackList";
import Artwork from "@/src/components/media-displays/Artwork";
import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import LinkedArtistList from "@/src/components/media-displays/LinkedArtistList";

export default function AlbumDisplay() {
  const pages = usePageContext();
  const audioPlayer = useAudioPlayer();
  const [album, state] = useDatabase(
    () => MusicLibrary.db.album.get({ id: pages.data }),
    null,
    "Album",
    [pages]
  );

  if (album === null) {
    return <FullCover />;
  }

  return (
    <>
      <div className="flex flex-col p-8 gap-8 overflow-auto h-full">
        <div className="flex flex-row gap-10">
          <div className="flex-none overflow-hidden w-1/5">
            <Artwork
              id={album.artwork?.id ?? null}
              rounded={false}
              className="rounded-2xl"
            />
          </div>
          <div className="grow flex flex-col justify-between">
            <div></div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold">{album.title}</span>
              <span className="text-xl">
                <LinkedArtistList
                  artistList={album.artists}
                  onClickArtist={(artistId) => {
                    pages.navigate("new", {
                      type: "artist list",
                      data: artistId,
                    });
                  }}
                />
              </span>
              <span className="text-xs font-semibold">
                {album.genre.name.toUpperCase()} &bull;{" "}
                {album.createdOn.getFullYear()}
              </span>
            </div>
            <div className="flex gap-4 pb-4">
              {[
                {
                  icon: <Play />,
                  name: "Play",
                  clickHandler: () => {
                    audioPlayer.play.album(album);
                    return;
                  },
                },
                // Not implemented yet
                // {
                //   icon: <Shuffle />,
                //   name: "Shuffle",
                //   clickHandler: () => {
                //     return;
                //   },
                // },
              ].map(({ icon, name, clickHandler }) => (
                <button
                  onClick={clickHandler}
                  className="bg-accent active:bg-accent-highlighted dark:invert text-white px-8 py-1 rounded-md gap-1 flex"
                  key={name}
                >
                  {icon} {name}
                </button>
              ))}
              <button
                className="ml-auto"
                onClick={() => {
                  alert("This is not a functional feature yet!");
                }}
              >
                <CircleEllipsis />
              </button>
            </div>
          </div>
        </div>
        <OrderedTrackList list={album.trackList} />
        <div className="font-light text-sm text-gray-500">
          <span>
            Created on {album.createdOn.toLocaleDateString()} at{" "}
            {album.createdOn.toLocaleTimeString()}
            {album.createdOn.getTime() !== album.modifiedOn.getTime() && (
              <>
                <br />
                Modified on {album.modifiedOn.toLocaleDateString()} at{" "}
                {album.modifiedOn.toLocaleTimeString()}
              </>
            )}
            {album.tags.length > 0 && (
              <>
                <br />
                Tags: {album.tags.map((tag) => "#" + tag.name).join(" ")}
              </>
            )}
          </span>
        </div>
      </div>
      {state === DataState.Stale && <Blur />}
    </>
  );
}
