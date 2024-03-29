import { useEffect, useRef, useState } from "react";

import LinkedArtistList from "@/src/components/media-displays/LinkedArtistList";

import { getApplicationDebugConfig } from "@/config/app";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Menu,
  PauseCircle,
  PlayCircle,
  Repeat,
  Repeat1,
} from "lucide-react";

type AudioProps = {
  onClickArtist: (artistId: string) => void;
  onClickQueue?: () => void;
};
export default function Audio(props: AudioProps) {
  const debugConfig = getApplicationDebugConfig();
  const audioPlayer = useAudioPlayer();
  const trackId = audioPlayer.useCurrentTrackId();
  const duration = audioPlayer.useDuration();
  const currentTime = audioPlayer.useCurrentTime();
  const repeatMode = audioPlayer.useRepeatMode();
  const audioLoaded = audioPlayer.useAudioLoaded();
  const isPlaying = audioPlayer.useIsPlaying();
  const percentLoaded = audioPlayer.usePercentLoaded();
  const loadingNewTrack = audioPlayer.useLoadingNewTrack();
  const [[track, artists], loadedMetaData] = useDatabase<
    [Music.DB.TableType<"Track"> | null, Music.HelperDB.ArtistConnection[]]
  >(
    async () => {
      if (trackId === null) return [null, []];
      const track = await MusicLibrary.db.track.get({ id: trackId });
      if (track === null) {
        return [null, []];
      }
      let artists: Music.HelperDB.ArtistConnection[] = [];
      if (track.artists.length !== 0) {
        artists = track.artists;
      } else {
        const album = await MusicLibrary.db.album.get({
          id: track.listConnections.find(
            (connection) => connection.trackList.album !== null
          )?.trackList.album?.id,
        });
        if (album) {
          artists = album.artists;
        }
      }
      if (window?.navigator?.mediaSession) {
        window.navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: artists
            .filter((a) => a.artistType === "MAIN")
            .map((a) => a.artist.name)
            .join(", "),
          album: track.listConnections.find(
            (connection) => connection.trackList.album !== null
          )?.trackList.album?.title,
        });
      }
      return [track, artists];
    },
    [null, []],
    ["Track", "Album"],
    [trackId]
  );

  const percentPlayed =
    duration !== null &&
    currentTime !== null &&
    !isNaN(duration) &&
    duration !== 0
      ? (currentTime / duration) * 100
      : 0;

  const seekBar = useRef<HTMLDivElement>(null);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    const calculateTime = (e: MouseEvent) => {
      if (seekBar.current && duration) {
        const max = seekBar.current.clientWidth;
        const seekLocation = Math.min(
          Math.max(e.clientX - seekBar.current.offsetLeft, 0),
          max
        );
        const percentage = seekLocation / max;
        return percentage * duration;
      }

      return NaN;
    };

    const onSeekMove = (e: MouseEvent) => {
      if (seeking) {
        audioPlayer.seekToTime(calculateTime(e));
      }
    };

    const onSeekUp = (e: MouseEvent) => {
      if (seeking) {
        audioPlayer.seekToTime(calculateTime(e), true);
        setSeeking(false);
      }
    };

    window.addEventListener("mousemove", onSeekMove);
    window.addEventListener("mouseup", onSeekUp);

    return () => {
      window.removeEventListener("mousemove", onSeekMove);
      window.removeEventListener("mouseup", onSeekUp);
    };
  }, [seeking, setSeeking, duration, audioPlayer]);

  const startSeek = () => {
    setSeeking(true);
  };

  return (
    <div className="flex flex-row justify-around gap-8 px-10">
      <div className="controls flex justify-center">
        <div className="grid grid-cols-4">
          <button
            className={
              "audio-button" +
              (repeatMode !== "none" ? " text-accent dark:invert" : "")
            }
            onClick={() => {
              const loop: Music.RepeatMode[] = ["none", "all", "one"];
              audioPlayer.setRepeatMode(
                loop[(loop.indexOf(audioPlayer.repeatMode) + 1) % loop.length]
              );
            }}
          >
            {repeatMode !== "one" ? (
              <Repeat size={40} />
            ) : (
              <Repeat1 size={40} />
            )}
          </button>
          <button
            className="audio-button"
            onClick={() => {
              audioPlayer.previousTrack(true);
            }}
          >
            <ChevronLeft size={40} />
          </button>
          <button
            className="audio-button col-start-3"
            onClick={() => {
              audioPlayer.toggleAudio();
            }}
            disabled={!audioLoaded || isPlaying === null}
          >
            {!audioLoaded ? (
              <Loader2 size={40} className="animate-spin" />
            ) : !isPlaying || isPlaying === null ? (
              <PlayCircle size={40} />
            ) : (
              <PauseCircle size={40} />
            )}
          </button>
          <button
            className="audio-button"
            onClick={() => {
              audioPlayer.nextTrack();
            }}
          >
            <ChevronRight size={40} />
          </button>
        </div>
      </div>
      <div className="flex flex-col grow text-center">
        {!loadingNewTrack && loadedMetaData === DataState.Loaded ? (
          <>
            <span id="song-title">{track?.title}</span>
            <span
              id="song-id"
              className="empty:before:content-[''] empty:before:inline-block text-gray-400"
            >
              {debugConfig?.showIds ? (
                track?.id
              ) : (
                <LinkedArtistList
                  artistList={artists}
                  onClickArtist={props.onClickArtist}
                />
              )}
            </span>
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
            style={{ width: percentLoaded * 100 + "%" }}
          ></div>
        </div>
      </div>
      <button
        className="my-auto mx-4 rounded-lg p-2 border-2"
        onClick={() => {
          props.onClickQueue?.();
        }}
      >
        <Menu />
      </button>
    </div>
  );
}
