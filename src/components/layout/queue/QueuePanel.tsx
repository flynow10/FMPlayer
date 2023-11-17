import QueueTrack from "@/src/components/layout/queue/QueueTrack";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";

type QueuePanelProps = {
  open: boolean;
};

export default function QueuePanel(props: QueuePanelProps) {
  const audioPlayer = useAudioPlayer();
  const playlist = audioPlayer.useTrackQueue();
  const isPlaying = audioPlayer.useIsPlaying();
  const currentTrackIndex = audioPlayer.useCurrentTrackIndex();
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
            return (
              <QueueTrack
                key={index}
                playing={isPlaying}
                activeTrack={index === currentTrackIndex}
                trackId={value.songId}
                onPlayTrack={() => {
                  audioPlayer.moveToTrack(index);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
