import { useMemo } from "react";

import Action from "@/src/components/functions/Action";
import ActionList from "@/src/components/functions/ActionList";
import Artwork from "@/src/components/media-displays/Artwork";
import Blur from "@/src/components/utils/loading/Blur";
import FullCover from "@/src/components/utils/loading/FullCover";

import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
// import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { useMediaContext } from "@/src/hooks/use-media-context";
import { flattenTree } from "@/src/music/functions/core/flatten-tree";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Functions } from "@/src/types/functions";

import { CircleEllipsis, Play } from "lucide-react";

export default function FunctionDisplay() {
  const pages = usePageContext();
  const audioPlayer = useAudioPlayer();
  const { show: showFunctionMenu } = useMediaContext("function");
  const [functionData, state] = useDatabase(
    () => MusicLibrary.db.function.get({ id: pages.data }),
    null,
    "Function",
    [pages]
  );

  const flatTree = useMemo(() => {
    if (!functionData) {
      return null;
    }
    if (!Array.isArray(functionData.functionData)) {
      throw new Error("Function data is malformed!");
    }
    return flattenTree(
      functionData.functionData as unknown as Functions.ActionState[]
    );
  }, [functionData]);

  if (functionData === null) {
    return <FullCover />;
  }

  if (!flatTree) {
    throw new Error("Function data is malformed!");
  }

  return (
    <>
      <div className="flex flex-col p-8 gap-8 overflow-auto h-full">
        <div className="flex flex-row gap-10">
          <div className="flex-none overflow-hidden w-1/5">
            <Artwork
              id={functionData.artwork?.id ?? null}
              rounded={false}
              className="rounded-2xl"
            />
          </div>
          <div className="grow flex flex-col justify-between">
            <div></div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold">
                {functionData.title}
              </span>
              <span className="text-xs font-semibold">
                {functionData.createdOn.getFullYear()}
              </span>
            </div>
            <div className="flex gap-4 pb-4">
              {[
                {
                  icon: <Play />,
                  name: "Play",
                  clickHandler: () => {
                    audioPlayer.play.func(functionData);
                    return;
                  },
                },
                // Not implemented yet
                // {
                //   icon: <Shuffle />,
                //   name: "Shuffle",
                //   clickHandler: () => {
                //     return;
                //   },
                // },
              ].map(({ icon, name, clickHandler }) => (
                <button
                  onClick={clickHandler}
                  className="bg-accent active:bg-accent-highlighted dark:invert text-white px-8 py-1 rounded-md gap-1 flex"
                  key={name}
                >
                  {icon} {name}
                </button>
              ))}
              <button
                className="ml-auto"
                onClick={(event) => {
                  showFunctionMenu({
                    event,
                    props: {
                      functionId: functionData.id,
                    },
                  });
                }}
              >
                <CircleEllipsis />
              </button>
            </div>
          </div>
        </div>
        <hr />
        <ActionList>
          {flatTree.map((action) => (
            <Action
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
        <hr />
        <div className="font-light text-sm text-gray-500">
          <span>
            Created on {functionData.createdOn.toLocaleDateString()} at{" "}
            {functionData.createdOn.toLocaleTimeString()}
            {functionData.createdOn.getTime() !==
              functionData.modifiedOn.getTime() && (
              <>
                <br />
                Modified on {functionData.modifiedOn.toLocaleDateString()} at{" "}
                {functionData.modifiedOn.toLocaleTimeString()}
              </>
            )}
            {functionData.tags.length > 0 && (
              <>
                <br />
                Tags: {functionData.tags.map((tag) => "#" + tag.name).join(" ")}
              </>
            )}
          </span>
        </div>
      </div>
      {state === DataState.Stale && <Blur />}
    </>
  );
}
