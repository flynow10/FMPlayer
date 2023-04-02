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
import { Song } from "./Music/Song";
import { ID } from "./Music/Types";

export type RepeatMode = "none" | "one" | "all";
export type AudioEvent = () => void;
export type AudioSongEvent = (song: Song) => void;
export type SongEndBehavior = "stop" | "play";
export type AudioSongEndEvent = (song: Song) => SongEndBehavior;
export type AudioProps = {
  id?: ID;
  repeatMode: RepeatMode;
  onPlay?: AudioSongEvent;
  onPause?: AudioSongEvent;
  onNext?: AudioEvent;
  onPrevious?: AudioEvent;
  onRepeatModeChange?: AudioEvent;
  onSongEnded?: AudioSongEndEvent;
};

export function Audio(props: AudioProps) {
  const song: Song = { duration: 1000, fileType: "mp3", id: "", title: "" };
  const loading = true;
  const playing = false;
  const togglePlay = () => {};
  const startSeek = () => {};
  const seekBar = useRef(null);
  const currentPercent = 0;
  return (
    <div className="flex flex-col">
      <div className="flex flex-col mx-auto text-center">
        <h3>{song?.title}</h3>
        <h3>{song?.id}</h3>
      </div>
      <div className="controls flex justify-center">
        {!loading ? (
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
            <button className="audio-button col-start-3" onClick={togglePlay}>
              {!playing ? <PlayCircle size={40} /> : <PauseCircle size={40} />}
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
            width: currentPercent + "%",
          }}
        ></div>
      </div>
    </div>
  );
}
