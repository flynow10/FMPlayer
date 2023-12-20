import { useMemo, useState } from "react";

import Action from "@/src/components/functions/Action";
import ActionList from "@/src/components/functions/ActionList";

import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { flattenTree } from "@/src/music/functions/core/flatten-tree";
import { Functions } from "@/src/types/functions";

import classNames from "classnames";
import { Code, List } from "lucide-react";

type QueuePanelProps = {
  open: boolean;
};

type DisplayMode = "tracks" | "code";

export default function QueuePanel(props: QueuePanelProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("tracks");
  const audioPlayer = useAudioPlayer();
  const trackQueue = audioPlayer.useTrackQueue();
  const currentFunctionState = audioPlayer.useCurrentFunctionState();

  const flatTree = useMemo(() => {
    if (!Array.isArray(trackQueue.functionTree)) {
      throw new Error("Function data is malformed!");
    }
    return flattenTree(
      trackQueue.functionTree as unknown as Functions.ActionState[]
    );
  }, [trackQueue]);

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
      <div className="flex flex-col bg-white h-full p-4 rounded-lg border-2 border-accent dark:border-inverted-accent">
        <div className="flex gap-8">
          <span className="font-bold text-lg">Up Next</span>
          <div className="ml-auto flex">
            <button
              onClick={() => {
                setDisplayMode("tracks");
              }}
              className={classNames("p-1", "px-2", "rounded-l-md", "border", {
                "bg-accent dark:bg-inverted-accent": displayMode === "tracks",
              })}
            >
              <List />
            </button>
            <button
              onClick={() => {
                setDisplayMode("code");
              }}
              className={classNames("p-1", "px-2", "rounded-r-md", "border", {
                "bg-accent dark:bg-inverted-accent": displayMode === "code",
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
            <ActionList>
              {flatTree.map((action) => (
                <Action
                  isActive={currentFunctionState?.currentActionId === action.id}
                  key={action.id}
                  action={action}
                  clone={false}
                  depth={action.depth}
                  ghost={false}
                  inToolBox={false}
                  handleProps={{}}
                  setAction={() => {}}
                />
              ))}
            </ActionList>
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
            <span>Not Implemented!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
