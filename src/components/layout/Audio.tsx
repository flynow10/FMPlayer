import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  PauseCircle,
  PlayCircle,
  Repeat,
  Repeat1,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";
import { DataState, useDatabase } from "@/src/hooks/use-database";

type AudioProps = {
  id: string | null;
  loaded: boolean;
  playing: boolean;
  percentLoaded: number;
  currentTime: number;
  duration: number;
  repeatMode: Music.RepeatMode;
  onTogglePlay?: Music.AudioEvent;
  onNext?: Music.AudioEvent;
  onPrevious?: Music.AudioEvent;
  onRepeatModeChange?: Music.AudioEvent;
  onStartSeek?: Music.AudioEvent;
  onSeekChange?: (time: number) => void;
  onStopSeek?: (time: number) => void;
};

export function Audio(props: AudioProps) {
  const [track, loadedMetaData] = useDatabase(
    async () => {
      if (!props.id) return null;
      return await MusicLibrary.db.track.get({ id: props.id });
    },
    null,
    ["Track"],
    [props.id]
  );

  const percentPlayed =
    !isNaN(props.duration) && props.duration !== 0
      ? (props.currentTime / props.duration) * 100
      : 0;

  const seekBar = useRef<HTMLDivElement>(null);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    const calculateTime = (e: MouseEvent) => {
      if (seekBar.current) {
        const max = seekBar.current.clientWidth;
        const seekLocation = Math.min(
          Math.max(e.clientX - seekBar.current.offsetLeft, 0),
          max
        );
        const percentage = seekLocation / max;
        return percentage * props.duration;
      }

      return NaN;
    };

    const onSeekMove = (e: MouseEvent) => {
      if (seeking) {
        props.onSeekChange?.(calculateTime(e));
      }
    };

    const onSeekUp = (e: MouseEvent) => {
      if (seeking) {
        props.onStopSeek?.(calculateTime(e));
        setSeeking(false);
      }
    };

    window.addEventListener("mousemove", onSeekMove);
    window.addEventListener("mouseup", onSeekUp);

    return () => {
      window.removeEventListener("mousemove", onSeekMove);
      window.removeEventListener("mouseup", onSeekUp);
    };
  }, [seeking, setSeeking, props]);

  const startSeek = () => {
    props.onStartSeek?.();
    setSeeking(true);
  };

  return (
    <div className="flex flex-row">
      <div className="controls flex justify-center">
        <div className="grid grid-cols-5">
          <button
            className={
              "audio-button" +
              (props.repeatMode !== "none" ? " text-blue-600" : "")
            }
            onClick={props.onRepeatModeChange}
            disabled={!props.loaded}
          >
            {props.repeatMode !== "one" ? (
              <Repeat size={40} />
            ) : (
              <Repeat1 size={40} />
            )}
          </button>
          <button
            className="audio-button"
            onClick={props.onPrevious}
            disabled={!props.loaded}
          >
            <ChevronLeft size={40} />
          </button>
          <button
            className="audio-button col-start-3"
            onClick={props.onTogglePlay}
            disabled={!props.loaded}
          >
            {!props.loaded ? (
              <Loader2 size={40} className="animate-spin" />
            ) : !props.playing ? (
              <PlayCircle size={40} />
            ) : (
              <PauseCircle size={40} />
            )}
          </button>
          <button
            className="audio-button"
            onClick={props.onNext}
            disabled={!props.loaded}
          >
            <ChevronRight size={40} />
          </button>
        </div>
      </div>
      <div className="flex flex-col grow text-center">
        {loadedMetaData === DataState.Loading ? (
          <>
            <h3 id="song-title">{track?.title}</h3>
            <h3 id="song-id">{track?.id}</h3>
          </>
        ) : (
          <Loader2 size={32} className="animate-spin mx-auto my-2" />
        )}

        <div
          className="w-full h-3 bg-slate-200 relative rounded-md overflow-hidden cursor-ew-resize"
          onMouseDown={startSeek}
          ref={seekBar}
        >
          <div
            className="z-20 h-full bg-slate-600 absolute top-0 left-0 pointer-events-none"
            style={{
              width: percentPlayed + "%",
            }}
          ></div>
          <div
            className="z-10 h-full bg-slate-300 absolute top-0 left-0 pointer-events-none"
            style={{ width: props.percentLoaded + "%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
