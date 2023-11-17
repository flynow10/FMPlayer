import QueueTrack from "@/src/components/layout/queue/QueueTrack";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import classNames from "classnames";
import { Code, List } from "lucide-react";
import { useState } from "react";

type QueuePanelProps = {
  open: boolean;
};

type DisplayMode = "tracks" | "code";

export default function QueuePanel(props: QueuePanelProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("tracks");
  const audioPlayer = useAudioPlayer();
  const playlist = audioPlayer.useTrackQueue();
  const isPlaying = audioPlayer.useIsPlaying();
  const currentTrackIndex = audioPlayer.useCurrentTrackIndex();
  return (
    <div
      className={classNames(
        "absolute",
        "top-0",
        "h-full",
        "z-50",
        "py-6",
        "transition-[right]",
        { "right-6": props.open, "-right-full": !props.open }
      )}
    >
      <div className="flex flex-col bg-white h-full max-w-xs p-4 rounded-lg border-2 border-accent dark:invert dark:bg-black dark:text-white">
        <div className="flex gap-8">
          <span className="font-bold text-lg">Up Next</span>
          <div className="ml-auto flex">
            <button
              onClick={() => {
                setDisplayMode("tracks");
              }}
              className={classNames("p-1", "px-2", "rounded-l-md", "border", {
                "bg-accent": displayMode === "tracks",
              })}
            >
              <List />
            </button>
            <button
              onClick={() => {
                setDisplayMode("code");
              }}
              className={classNames("p-1", "px-2", "rounded-r-md", "border", {
                "bg-accent": displayMode === "code",
              })}
            >
              <Code />
            </button>
          </div>
        </div>
        <hr className="my-2" />
        <div className="relative h-full overflow-hidden">
          <div
            className={classNames(
              "relative",
              "top-0",
              "flex",
              "flex-col",
              "h-full",
              "overflow-y-auto",
              "transition-all",
              {
                "left-0": displayMode === "code",
                "-left-full": displayMode === "tracks",
              }
            )}
          >
            <span>Not Implemented!</span>
          </div>
          <div
            className={classNames(
              "relative",
              "z-10",
              "-top-full",
              "flex",
              "flex-col",
              "h-full",
              "overflow-y-auto",
              "transition-all",
              {
                "right-0": displayMode === "tracks",
                "-right-full": displayMode === "code",
              }
            )}
          >
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
    </div>
  );
}
