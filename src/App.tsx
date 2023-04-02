import { useEffect, useState } from "react";
import { Audio, RepeatMode } from "./Audio";
import { MyMusicLibrary } from "./Music/MusicLibrary";
import { Playlist } from "./Music/Playlists/Playlist";
import { Queue } from "./Queue";
import { UUID } from "./UUID";

function App() {
  const [queue, setQueue] = useState<Playlist>(new Playlist());
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  useEffect(() => {
    const playlist = MyMusicLibrary.getAllPlaylists()[0];
    setQueue(playlist);
  }, []);
  return (
    <div className="flex flex-col justify-between">
      <UUID />
      <div className="mx-auto">
        <Queue playlist={queue} currentSongIndex={currentSongIndex} />
      </div>
      <div className="bottom-bar w-4/6 mx-auto my-28">
        <Audio
          id={queue.songList[currentSongIndex]?.songId}
          repeatMode={repeatMode}
          onRepeatModeChange={() => {
            const modes: RepeatMode[] = ["none", "all", "one"];
            setRepeatMode(
              modes[(modes.indexOf(repeatMode) + 1) % modes.length]
            );
          }}
          onSongEnded={(song) => {
            if (repeatMode === "one") {
              return "play";
            }
            if (currentSongIndex >= queue.songList.length - 1) {
              if (repeatMode === "all") {
                setCurrentSongIndex(0);
                return "play";
              }
              return "stop";
            }
            setCurrentSongIndex(currentSongIndex + 1);
            return "play";
          }}
          onNext={() => {
            if (currentSongIndex < queue.songList.length - 1) {
              setCurrentSongIndex(currentSongIndex + 1);
            } else {
              setCurrentSongIndex(0);
            }
          }}
          onPrevious={() => {
            if (currentSongIndex > 0) {
              setCurrentSongIndex(currentSongIndex - 1);
            } else if (repeatMode === "all") {
              setCurrentSongIndex(queue.songList.length - 1);
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
