import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";

type QueuePanelProps = {
  open: boolean;
};

export default function QueuePanel(props: QueuePanelProps) {
  const audioPlayer = useAudioPlayer();
  const playlist = audioPlayer.useTrackQueue();
  // const trackIndex = audioPlayer.useCurrentTrackIndex();
  return (
    <div
      className={
        "absolute top-0 h-full z-50 py-6 transition-[right] " +
        (props.open ? "right-6" : "-right-full")
      }
    >
      <div className="flex flex-col bg-white h-full max-w-xs p-4 rounded-lg border-2 border-accent dark:invert dark:bg-black dark:text-white">
        <span className="font-bold text-lg">Up Next</span>
        <hr className="my-2" />
        <div className="flex flex-col overflow-y-auto">
          {playlist.trackList.map((value, index) => {
            return <QueueTrack key={index} trackId={value.songId} />;
          })}
        </div>
      </div>
    </div>
  );
}

type QueueTrackProps = {
  trackId: string;
};

// eslint-disable-next-line react/no-multi-comp
function QueueTrack(props: QueueTrackProps) {
  const [track, state] = useDatabase(
    () => {
      return MusicLibrary.db.track.get({
        id: props.trackId,
      });
    },
    null,
    "Track",
    [props.trackId]
  );

  if (state === DataState.Loading || track === null) {
    return <FullCover />;
  }
  return <div>{track.title}</div>;
}
