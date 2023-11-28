import FunctionEditorContext from "@/src/components/functions/FunctionEditorContext";
import SortableFunctionDisplay from "@/src/components/functions/SortableFunctionDisplay";
import Toolbox from "@/src/components/functions/Toolbox";
import TrackOverlay from "@/src/components/functions/drag-overlays/TrackOverlay";
import { generateGroupId } from "@/src/music/functions/utils/generate-group-id";
import { Functions } from "@/src/types/functions";
import { useState } from "react";

export default function FunctionEditor() {
  const [functionTree, setFunctionTree] = useState<Functions.FunctionTree>([
    {
      id: generateGroupId("actions"),
      children: [],
      type: "play",
      trackExpression: null,
    },
    {
      id: generateGroupId("actions"),
      children: [
        {
          id: generateGroupId("actions"),
          children: [],
          type: "play",
          trackExpression: null,
        },
        {
          id: generateGroupId("actions"),
          children: [],
          type: "loop",
        },
        {
          id: generateGroupId("actions"),
          children: [],
          type: "play",
          trackExpression: null,
        },
      ],
      type: "loop",
    },
  ]);
  return (
    <div className="flex h-full overflow-hidden">
      <FunctionEditorContext
        functionTree={functionTree}
        setFunctionTree={setFunctionTree}
      >
        <Toolbox setFunctionTree={setFunctionTree} />
        <SortableFunctionDisplay
          functionTree={functionTree}
          setFunctionTree={setFunctionTree}
        />
        <TrackOverlay functionTree={functionTree} />
      </FunctionEditorContext>
      {/* <pre className="border-l-2 p-2 text-sm overflow-auto">
        {JSON.stringify(functionTree, null, 2)}
      </pre> */}
    </div>
  );
}
