import FunctionEditorContext from "@/src/components/functions/FunctionEditorContext";
import SortableFunctionDisplay from "@/src/components/functions/SortableFunctionDisplay";
import Toolbox from "@/src/components/functions/Toolbox";
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
    <FunctionEditorContext
      functionTree={functionTree}
      setFunctionTree={setFunctionTree}
    >
      <div className="flex h-full overflow-hidden">
        <Toolbox setFunctionTree={setFunctionTree} />
        <SortableFunctionDisplay functionTree={functionTree} />
      </div>
    </FunctionEditorContext>
  );
}
