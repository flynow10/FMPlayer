import Artwork from "@/src/components/media-displays/Artwork";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import classNames from "classnames";
import bouncingLines from "/bouncing-lines.svg";

type QueuePanelProps = {
  open: boolean;
};

export default function QueuePanel(props: QueuePanelProps) {
  const audioPlayer = useAudioPlayer();
  const playlist = audioPlayer.useTrackQueue();
  const isPlaying = audioPlayer.useIsPlaying();
  const currentTrackIndex = audioPlayer.useCurrentTrackIndex();
  return (
    <div
      className={
        "absolute top-0 h-full z-50 py-6 transition-[right] " +
        (props.open ? "right-6" : "-right-full")
      }
    >
      <div className="flex flex-col bg-white h-full max-w-xs p-4 rounded-lg border-2 border-accent dark:invert dark:bg-black dark:text-white">
        <span className="font-bold text-lg">Up Next</span>
        <hr className="my-2" />
        <div className="flex flex-col overflow-y-auto">
          {playlist.trackList.map((value, index) => {
            return (
              <QueueTrack
                key={index}
                playing={isPlaying}
                activeTrack={index === currentTrackIndex}
                trackId={value.songId}
                onPlayTrack={() => {
                  audioPlayer.moveToTrack(index);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

type QueueTrackProps = {
  trackId: string;
  playing: boolean;
  activeTrack: boolean;
  onPlayTrack: () => void;
};

// eslint-disable-next-line react/no-multi-comp
function QueueTrack(props: QueueTrackProps) {
  const [track, state] = useDatabase(
    () => {
      return MusicLibrary.db.track.get({
        id: props.trackId,
      });
    },
    null,
    "Track",
    [props.trackId]
  );

  if (state === DataState.Loading || track === null) {
    return <FullCover />;
  }
  return (
    <div
      className={classNames(
        "flex gap-2 p-2 hover:bg-slate-400 rounded-md cursor-pointer"
      )}
      onClick={props.onPlayTrack}
    >
      <div className="w-10 my-auto relative overflow-hidden rounded-md">
        <Artwork
          id={track.artwork?.id ?? null}
          className={"invert" + (props.activeTrack ? " blur-sm" : "")}
          imgClassName={classNames({
            "brightness-75": props.activeTrack,
          })}
          rounded={true}
        />
        {props.activeTrack &&
          (props.playing ? (
            <img
              src={bouncingLines}
              className="absolute top-0 left-0 w-full h-full text-white z-10"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              className="absolute top-0 left-0 w-full h-full text-white z-10"
            >
              <path id="p1" d="M6,12v0" />
              <path d="M12,12v0" />
              <path d="M18,12v0" />
            </svg>
          ))}
      </div>
      <span className="my-auto">{track.title}</span>
    </div>
  );
}
