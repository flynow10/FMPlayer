import Artwork from "@/src/components/media-displays/Artwork";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import classNames from "classnames";
import bouncingLines from "/bouncing-lines.svg";
import LoadingSpinner from "@/src/components/utils/loading/LoadingSpinner";

type QueueTrackProps = {
  trackId: string;
  playing: boolean;
  activeTrack: boolean;
  onPlayTrack: () => void;
};

export default function QueueTrack(props: QueueTrackProps) {
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

  const onClick = (isDblClick: boolean) => {
    if (isDblClick || !props.activeTrack) {
      props.onPlayTrack();
    }
  };

  if (state === DataState.Loading || track === null) {
    return <LoadingSpinner />;
  }
  return (
    <div
      className={classNames(
        "flex gap-2 p-2 hover:bg-slate-400 rounded-md cursor-pointer"
      )}
      onClick={() => onClick(false)}
      onDoubleClick={() => onClick(true)}
    >
      <div className="w-10 shrink-0 my-auto relative overflow-hidden rounded-md">
        <Artwork
          id={track.artwork?.id ?? null}
          className={classNames({
            "blur-sm": props.activeTrack,
          })}
          imgClassName={classNames({
            "brightness-75": props.activeTrack,
          })}
          rounded={true}
        />
        {props.activeTrack &&
          (props.playing ? (
            <img
              src={bouncingLines}
              className="absolute top-0 left-0 w-full h-full text-white dark:invert z-10"
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
              className="absolute top-0 left-0 w-full h-full text-white dark:invert z-10"
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
