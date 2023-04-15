import { useEffect, useRef, useState } from "react";
import { MyMusicLibrary } from "./MusicLibrary";

export function useAudioPlayer(id: string | null, onSongEnded?: () => void) {
  const audioTag = useRef(new Audio());
  const mediaSourceNode = useRef<MediaElementAudioSourceNode>();

  const [loaded, setLoaded] = useState(false);
  const [percentLoaded, setPercentLoaded] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const seekToTime = (time: number, end: boolean = false) => {
    if (!audioTag.current.paused) {
      audioTag.current.pause();
    }
    setSeeking(true);
    audioTag.current.currentTime = time;
    if (end && playing) {
      setSeeking(false);
      audioTag.current.play();
    }
  };

  const resetPlayback = () => {
    audioTag.current.currentTime = 0;
  };

  const startPlayback = () => {
    if (mediaSourceNode.current === undefined) {
      const ctx = new AudioContext();
      mediaSourceNode.current = new MediaElementAudioSourceNode(ctx, {
        mediaElement: audioTag.current,
      });
      mediaSourceNode.current.connect(ctx.destination);
    }
    setPlaying(true);
    if (loaded) {
      audioTag.current.play();
    }
  };

  const pausePlayback = () => {
    setPlaying(false);
    audioTag.current.pause();
  };

  useEffect(() => {
    audioTag.current.crossOrigin = "*";
  }, [audioTag]);

  useEffect(() => {
    if (id !== null) {
      const url = MyMusicLibrary.getSongUrl(id);
      if (url !== null) {
        audioTag.current.src = url;
        audioTag.current.load();
      }
    }
    return () => {
      setLoaded(false);
      setPercentLoaded(0);
      setCurrentTime(0);
      setDuration(0);
      audioTag.current.src = "";
    };
  }, [id]);

  useEffect(() => {
    if (onSongEnded) {
      audioTag.current.addEventListener("ended", onSongEnded);
    }
    return () => {
      if (onSongEnded) {
        audioTag.current.removeEventListener("ended", onSongEnded);
      }
    };
  }, [onSongEnded]);

  useEffect(() => {
    const canPlayThroughCallback = () => {
      console.log("Can play through");
      setLoaded(true);
      if (playing && !seeking) {
        audioTag.current.play();
      }
    };
    const progressCallback = (e: ProgressEvent<EventTarget>) => {
      if (e.total && e.loaded) {
        console.log("Progress: ", e);
        const percentLoaded = (e.total / e.loaded) * 100;
        setPercentLoaded(percentLoaded);
      }
    };
    const timeUpdateCallback = () => {
      setCurrentTime(audioTag.current.currentTime);
      if (!isNaN(audioTag.current.duration)) {
        setDuration(audioTag.current.duration);
      }
    };
    audioTag.current.addEventListener("canplaythrough", canPlayThroughCallback);
    audioTag.current.addEventListener("progress", progressCallback);
    audioTag.current.addEventListener("timeupdate", timeUpdateCallback);
    return () => {
      audioTag.current.removeEventListener(
        "canplaythrough",
        canPlayThroughCallback
      );
      audioTag.current.removeEventListener("progress", progressCallback);
      audioTag.current.removeEventListener("timeupdate", timeUpdateCallback);
    };
  }, [
    audioTag.current,
    setLoaded,
    setPercentLoaded,
    setCurrentTime,
    setDuration,
    playing,
    seeking,
  ]);
  return {
    loaded,
    percentLoaded,
    playing,
    currentTime,
    duration,
    startPlayback,
    pausePlayback,
    resetPlayback,
    seekToTime,
  };
}
