import { useEffect, useRef, useState } from "react";
import { MyMusicLibrary } from "@/Music/Library/MusicLibrary";

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
    var active = true;
    if (id !== null) {
      (async () => {
        const url = await MyMusicLibrary.getMusicFileUrl(id);
        if (url !== undefined && active) {
          audioTag.current.src = url;
          audioTag.current.load();
        }
      })();
    }
    return () => {
      active = false;
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
      setLoaded(true);
      if (playing && !seeking) {
        audioTag.current.play();
      }
    };
    const progressCallback = () => {
      const buffered = audioTag.current.buffered;

      if (buffered.length) {
        setPercentLoaded((100 * buffered.end(0)) / audioTag.current.duration);
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
