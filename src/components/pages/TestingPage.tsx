import Action from "@/src/components/functions/Action";
import ActionList from "@/src/components/functions/ActionList";
import { useDatabase } from "@/src/hooks/use-database";
import { PlayableFunction } from "@/src/music/functions/core/playable-function";
import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Functions } from "@/src/types/functions";
import { useMemo, useState } from "react";

export default function TestingPage() {
  const [playableFunction] = useDatabase<PlayableFunction>(
    async () => {
      const functionData = await MusicLibrary.db.function.get({
        id: "6cf5db35-4595-4766-8907-2749d269b470",
      });
      if (!functionData) {
        throw new Error("Failed to load function!");
      }
      return new PlayableFunction(
        functionData.functionData as unknown as Functions.FunctionTree
      );
    },
    new PlayableFunction([]),
    "Function"
  );
  const flatTree = useMemo(() => {
    return flattenTree(playableFunction.functionTree);
  }, [playableFunction]);
  const [nextState, setNextState] = useState<
    Functions.RuntimeState | undefined
  >();
  const [currentState, setCurrentState] = useState<
    Functions.RuntimeState | undefined
  >();
  const [currentTrack, setCurrentTrack] = useState("");
  const nextTrack = () => {
    const [currentTrack, newNextState, newCurrentState] =
      playableFunction.getNextTrack(nextState);
    if (currentTrack) {
      setCurrentTrack(currentTrack);
    } else {
      setCurrentTrack("");
    }
    setNextState(newNextState);
    setCurrentState(newCurrentState);
  };
  return (
    <div className="flex gap-2">
      <ActionList>
        {flatTree.map((action) => (
          <Action
            key={action.id}
            action={action}
            clone={false}
            depth={action.depth}
            ghost={false}
            isActive={action.id === currentState?.currentActionId}
            inToolBox={false}
            handleProps={{}}
            setAction={() => {}}
          />
        ))}
      </ActionList>
      <div className="flex flex-col gap-2 grow">
        <button className="border rounded-md p-2" onClick={nextTrack}>
          Next Track
        </button>
        <span>Current Track ID: {currentTrack}</span>
        <hr />
        <div>
          <span>Current State:</span>
          <pre>{JSON.stringify(currentState, null, 2)}</pre>
        </div>
        <hr />
        <div>
          <span>Next State:</span>
          <pre>{JSON.stringify(nextState, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
