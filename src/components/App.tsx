import { Suspense, useState } from "react";
import { Audio } from "@/src/components/layout/Audio";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Playlist } from "@/src/music/playlists/playlist";
import AudioControlPlaceholder from "@/src/components/layout/AudioControlPlaceholder";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import Main from "@/src/components/layout/Main";
import Sidebar from "@/src/components/layout/Sidebar";
import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { PlaylistHelper } from "@/src/music/utils/playlist-helper";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { Await, useLoaderData } from "react-router-dom";

export default function App() {
  const [queue, setQueue] = useState<Playlist>(new Playlist());
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<Music.RepeatMode>("none");
  const [location, setLocation] = useState<Pages.Location>("Recently Added");
  const [searchString, setSearchString] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const routerLoadingData = useLoaderData() as {
    [key: string]: Promise<unknown>;
  };

  const songId = queue.isBlank()
    ? null
    : queue.songList[currentSongIndex].songId;
  const audioPlayer = useAudioPlayer(songId, () => {
    nextSong(false);
  });

  const beginPlayback = async () => {
    const playlist = new Playlist();
    playlist.addAction(
      new PlaySongAction((await MusicLibrary.db.track.list())[0].id)
    );
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

  const nextSong = (isManual = false) => {
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
            const modes: Music.RepeatMode[] = ["none", "all", "one"];
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
    <Suspense fallback={<FullCover />}>
      <Await resolve={Promise.all(Object.values(routerLoadingData))}>
        <div className="app-container grid grid-cols-6 grid-rows-[minmax(0,6fr)_minmax(0,1fr)] h-full max-h-full">
          <Sidebar
            location={location}
            isSearching={isSearching}
            onSelectTab={(toLocation) => {
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
            onPlayMedia={async (id, type) => {
              let playlist;

              switch (type) {
                case "album": {
                  const album = await MusicLibrary.db.album.get({ id });

                  if (album) {
                    playlist = PlaylistHelper.getPlaylistFromAlbum(album);
                  }

                  break;
                }

                case "track": {
                  const track = await MusicLibrary.db.track.get({ id });

                  if (track) {
                    playlist = new Playlist().addAction(
                      new PlaySongAction(track.id)
                    );
                  }

                  break;
                }
                // case "playlist":
                //   playlist = MyMusicLibrary.getPlaylist(id);
                //   break;
              }

              if (playlist) {
                setQueue(playlist);
                setCurrentSongIndex(0);
                audioPlayer.startPlayback();
              }
            }}
          />
          {audioComponent}
        </div>
      </Await>
    </Suspense>
  );
}
