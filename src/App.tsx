import { useState } from "react";
import { Audio, RepeatMode } from "@/components/Audio";
import { MyMusicLibrary } from "@/Music/Library/MusicLibrary";
import { Playlist } from "@/Music/Playlists/Playlist";
import AudioControlPlaceholder from "@/components/AudioControlPlaceholder";
import { useAudioPlayer } from "@/Music/useAudioPlayer";
import Main, { Location } from "./components/Main";
import Sidebar from "./components/Sidebar";
import { PlaySongAction } from "./Music/Actions/PlaySongAction";
import { MediaType } from "./Music/Types";

function App() {
  const [queue, setQueue] = useState<Playlist>(new Playlist());
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [location, setLocation] = useState<Location>(Location.Import);
  const [searchString, setSearchString] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const songId = queue.isBlank()
    ? null
    : queue.songList[currentSongIndex].songId;
  const audioPlayer = useAudioPlayer(songId, () => {
    nextSong(false);
  });

  const beginPlayback = async () => {
    const playlist = new Playlist();
    const songs = await MyMusicLibrary.getSongList();
    if (songs.length === 0) return;
    playlist.addAction(new PlaySongAction(songs[0].id));
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
    // REMOVE MAGIC NUMBER (eventually :) )
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
      audioPlayer.resetPlayback();
    }
  };
  const audioComponent = (
    <div className="audio-controls px-20 py-4 border-t-2">
      {queue.isBlank() ? (
        <AudioControlPlaceholder onPlay={beginPlayback} />
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
  );
  return (
    <div className="app-container grid grid-cols-6 grid-rows-[minmax(0,6fr)_minmax(0,1fr)] h-full max-h-full">
      <Sidebar
        location={location}
        isSearching={isSearching}
        onNavigate={(toLocation) => {
          setLocation(toLocation);
          setIsSearching(false);
        }}
        onSearch={(newSearch) => {
          if (newSearch === "") {
            setIsSearching(false);
          } else {
            setIsSearching(true);
          }
          setSearchString(newSearch);
        }}
      />
      <Main
        location={location}
        searchString={searchString}
        isSearching={isSearching}
        onPlayMedia={(id, type) => {
          // var playlist;
          // switch (type) {
          //   case MediaType.Album:
          //     const album = MyMusicLibrary.getAlbum(id);
          //     if (album) {
          //       playlist = MyMusicLibrary.getPlaylistFromAlbum(album);
          //     }
          //     break;
          //   case MediaType.Song:
          //     const song = MyMusicLibrary.getSong(id);
          //     if (song) {
          //       playlist = new Playlist().addAction(
          //         new PlaySongAction(song.id)
          //       );
          //     }
          //     break;
          //   case MediaType.Playlist:
          //     playlist = MyMusicLibrary.getPlaylist(id);
          //     break;
          // }
          // if (playlist) {
          //   setQueue(playlist);
          //   setCurrentSongIndex(0);
          //   audioPlayer.startPlayback();
          // }
        }}
      />
      {audioComponent}
    </div>
  );
}

export default App;
