import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  PauseCircle,
  PlayCircle,
  Repeat,
  Repeat1,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Song } from "@/Music/Song";
import { ID } from "@/Music/Types";
import { MyMusicLibrary } from "@/Music/MusicLibrary";

export type RepeatMode = "none" | "one" | "all";
export type AudioEvent = () => void;
export type SongEndBehavior = "stop" | "play";
export type AudioProps = {
  id: ID | null;
  loaded: boolean;
  playing: boolean;
  percentLoaded: number;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  onTogglePlay?: AudioEvent;
  onNext?: AudioEvent;
  onPrevious?: AudioEvent;
  onRepeatModeChange?: AudioEvent;
  onStartSeek?: AudioEvent;
  onSeekChange?: (time: number) => void;
  onStopSeek?: (time: number) => void;
};

export function Audio(props: AudioProps) {
  const song: Song | null = useMemo(
    () => (props.id ? MyMusicLibrary.getSong(props.id) : null),
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
  }, [seeking, setSeeking, props.onStopSeek, props.onSeekChange]);

  const startSeek = () => {
    props.onStartSeek?.();
    setSeeking(true);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col mx-auto text-center">
        <h3 id="song-title">{song?.title}</h3>
        <h3 id="song-id">{song?.id}</h3>
      </div>
      <div className="controls flex justify-center">
        {props.loaded ? (
          <div className="grid grid-cols-5 gap-24">
            <button
              className={
                "audio-button" +
                (props.repeatMode !== "none" ? " text-blue-600" : "")
              }
              onClick={props.onRepeatModeChange}
            >
              {props.repeatMode !== "one" ? (
                <Repeat size={40} />
              ) : (
                <Repeat1 size={40} />
              )}
            </button>
            <button className="audio-button" onClick={props.onPrevious}>
              <ChevronLeft size={40} />
            </button>
            <button
              className="audio-button col-start-3"
              onClick={props.onTogglePlay}
            >
              {!props.playing ? (
                <PlayCircle size={40} />
              ) : (
                <PauseCircle size={40} />
              )}
            </button>
            <button className="audio-button" onClick={props.onNext}>
              <ChevronRight size={40} />
            </button>
          </div>
        ) : (
          <Loader2 size={40} className="animate-spin audio-button" />
        )}
      </div>
      <div
        className="w-full h-3 bg-slate-200 relative rounded-md overflow-hidden"
        onMouseDown={startSeek}
        ref={seekBar}
      >
        <div
          className="h-full bg-slate-600 absolute top-0 left-0 pointer-events-none"
          style={{
            width: percentPlayed + "%",
          }}
        ></div>
        <div
          className="h-full bg-slate-300 absolute top-0 left-0 pointer-events-none"
          style={{ width: props.percentLoaded + "%" }}
        ></div>
      </div>
    </div>
  );
}
