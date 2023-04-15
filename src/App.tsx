import { useState } from "react";
import { Audio, RepeatMode } from "./Audio";
import { MyMusicLibrary } from "./Music/MusicLibrary";
import { Playlist } from "./Music/Playlists/Playlist";
import AudioControlPlaceholder from "./AudioControlPlaceholder";
import { useAudioPlayer } from "./Music/useAudioPlayer";

function App() {
  const [queue, setQueue] = useState<Playlist>(new Playlist());
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const songId = queue.isBlank()
    ? null
    : queue.songList[currentSongIndex].songId;
  const audioPlayer = useAudioPlayer(songId, () => {
    nextSong(false);
  });

  const playPlaylist = () => {
    const playlist = MyMusicLibrary.getAllPlaylists()[0];
    setQueue(playlist);
    audioPlayer.startPlayback();
  };
  const togglePlayback = () => {
    if (!audioPlayer.playing) {
      audioPlayer.startPlayback();
    } else {
      audioPlayer.pausePlayback();
    }
  };
  const previousSong = () => {
    if (audioPlayer.currentTime > 3 || repeatMode === "one") {
      audioPlayer.resetPlayback();
      audioPlayer.startPlayback();
      return;
    }
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    } else if (repeatMode === "all") {
      setCurrentSongIndex(queue.songList.length - 1);
    } else {
      audioPlayer.resetPlayback();
      audioPlayer.startPlayback();
    }
  };
  const nextSong = (isManual: boolean = false) => {
    if (repeatMode === "one" && !isManual) {
      audioPlayer.resetPlayback();
      audioPlayer.startPlayback();
      return;
    }
    if (currentSongIndex < queue.songList.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    } else {
      setCurrentSongIndex(0);
      if (repeatMode === "none") {
        audioPlayer.pausePlayback();
      }
    }
  };
  return (
    <div className="flex flex-col justify-between">
      <div className="bottom-bar w-4/6 mx-auto my-28">
        {queue.isBlank() ? (
          <AudioControlPlaceholder onPlay={playPlaylist} />
        ) : (
          <Audio
            id={songId}
            loaded={audioPlayer.loaded}
            percentLoaded={audioPlayer.percentLoaded}
            currentTime={audioPlayer.currentTime}
            duration={audioPlayer.duration}
            playing={audioPlayer.playing}
            onTogglePlay={togglePlayback}
            repeatMode={repeatMode}
            onRepeatModeChange={() => {
              const modes: RepeatMode[] = ["none", "all", "one"];
              setRepeatMode(
                modes[(modes.indexOf(repeatMode) + 1) % modes.length]
              );
            }}
            onNext={() => {
              nextSong(true);
            }}
            onPrevious={previousSong}
            onSeekChange={audioPlayer.seekToTime}
            onStopSeek={(time) => {
              audioPlayer.seekToTime(time, true);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
