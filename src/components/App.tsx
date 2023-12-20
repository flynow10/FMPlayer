import { useRef, useState } from "react";

import Audio from "@/src/components/layout/Audio";
import AudioControlPlaceholder from "@/src/components/layout/AudioControlPlaceholder";
import Main from "@/src/components/layout/Main";
import Sidebar from "@/src/components/layout/Sidebar";

import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Pages } from "@/src/types/pages";

export default function App() {
  const [location, setLocation] = useState<Pages.Location>("Recently Added");
  const [searchString, setSearchString] = useState("");
  const [queueOpen, setQueueOpen] = useState(false);

  const navigationMethod = useRef<Pages.NavigationMethod>();
  const audioPlayer = useAudioPlayer();
  const hasPlayedOnce = audioPlayer.useHasPlayedOnce();

  const beginPlayback = async () => {
    const albums = await MusicLibrary.db.album.list();
    if (albums.length === 0) {
      const tracks = await MusicLibrary.db.track.list();
      if (tracks.length === 0) {
        alert("You have no music in your library! Try adding some!");
      }
      await audioPlayer.play.track(
        tracks[Math.floor(Math.random() * tracks.length)].id
      );
      return;
    }
    await audioPlayer.play.album(
      albums[Math.floor(Math.random() * albums.length)]
    );
  };

  const audioComponent = (
    <div className="audio-controls py-4 border-t-2">
      {!hasPlayedOnce ? (
        <AudioControlPlaceholder onPlay={beginPlayback} />
      ) : (
        <Audio
          onClickArtist={(artistId: string) => {
            if (navigationMethod.current) {
              navigationMethod.current("new", {
                type: "artist list",
                data: artistId,
              });
            } else {
              alert("An error occurred! Unable to navigate artist page!");
            }
          }}
          onClickQueue={() => {
            setQueueOpen(!queueOpen);
          }}
        />
      )}
    </div>
  );
  return (
    <div className="app-container grid grid-cols-6 grid-rows-[minmax(0,6fr)_minmax(0,1fr)] h-full max-h-full">
      <Sidebar
        location={location}
        isSearching={location === "Search"}
        onSelectTab={(toLocation) => {
          setLocation(toLocation);
        }}
        onFocusSearch={() => {
          if (MusicLibrary.search.hasNotLoaded()) {
            MusicLibrary.search.loadDocuments();
          }
          if (searchString !== "") {
            setLocation("Search");
          }
        }}
        onSearch={(newSearch) => {
          if (newSearch !== "") {
            setLocation("Search");
            setSearchString(newSearch);
          }
        }}
      />
      <Main
        location={location}
        searchString={searchString}
        navigationRef={navigationMethod}
        queueOpen={queueOpen}
      />
      {audioComponent}
    </div>
  );
}
