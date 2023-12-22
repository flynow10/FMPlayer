import { useEffect } from "react";

import Artwork from "@/src/components/media-displays/Artwork";
import OrderedTrackList from "@/src/components/media-displays/OrderedTrackList";
import Blur from "@/src/components/utils/loading/Blur";
import FullCover from "@/src/components/utils/loading/FullCover";

import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { useMediaContext } from "@/src/hooks/use-media-context";
import { MusicLibrary } from "@/src/music/library/music-library";

import { CircleEllipsis, Play } from "lucide-react";
import { toast } from "react-toastify";

export default function PlaylistDisplay() {
  const pages = usePageContext();
  const audioPlayer = useAudioPlayer();
  const { show: showContextMenu } = useMediaContext("playlist");
  const [playlist, state] = useDatabase(
    () => MusicLibrary.db.playlist.get({ id: pages.data }),
    null,
    "Playlist",
    [pages]
  );

  useEffect(() => {
    if (state === DataState.Loaded && playlist === null) {
      pages.navigate("back");
      toast("This playlist could not be found!", { type: "error" });
    }
  }, [playlist, state, pages]);

  if (playlist === null) {
    return <FullCover />;
  }

  return (
    <>
      <div className="flex flex-col p-8 gap-8 overflow-auto h-full">
        <div className="flex flex-row gap-10">
          <div className="flex-none overflow-hidden w-1/5">
            <Artwork
              id={playlist.artwork?.id ?? null}
              rounded={false}
              className="rounded-2xl"
            />
          </div>
          <div className="grow flex flex-col justify-between">
            <div></div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold">{playlist.title}</span>
              <span className="text-xs font-semibold">
                {playlist.trackList.trackConnections.length} TRACKS &bull;{" "}
                {playlist.createdOn.getFullYear()}
              </span>
            </div>
            <div className="flex gap-4 pb-4">
              {[
                {
                  icon: <Play />,
                  name: "Play",
                  clickHandler: () => {
                    audioPlayer.play.trackList(playlist.trackList);
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
                onClick={(event) => {
                  showContextMenu({
                    event,
                    props: {
                      playlistId: pages.data,
                    },
                  });
                }}
              >
                <CircleEllipsis />
              </button>
            </div>
          </div>
        </div>
        <OrderedTrackList list={playlist.trackList} />
        <div className="font-light text-sm text-gray-500">
          <span>
            Created on {playlist.createdOn.toLocaleDateString()} at{" "}
            {playlist.createdOn.toLocaleTimeString()}
            {playlist.createdOn.getTime() !== playlist.modifiedOn.getTime() && (
              <>
                <br />
                Modified on {playlist.modifiedOn.toLocaleDateString()} at{" "}
                {playlist.modifiedOn.toLocaleTimeString()}
              </>
            )}
            {playlist.tags.length > 0 && (
              <>
                <br />
                Tags: {playlist.tags.map((tag) => "#" + tag.name).join(" ")}
              </>
            )}
          </span>
        </div>
      </div>
      {state === DataState.Stale && <Blur />}
    </>
  );
}
