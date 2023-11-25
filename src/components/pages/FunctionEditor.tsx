import FunctionEditorContext from "@/src/components/functions/FunctionEditorContext";
import SortableFunctionDisplay from "@/src/components/functions/SortableFunctionDisplay";
import { Functions } from "@/src/types/functions";
import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function FunctionEditor() {
  const [functionTree, setFunctionTree] = useState<Functions.FunctionTree>([
    {
      id: uuid(),
      children: [],
      type: "play",
    },
    {
      id: uuid(),
      children: [
        {
          id: uuid(),
          children: [],
          type: "play",
        },
        {
          id: uuid(),
          children: [],
          type: "loop",
        },
        {
          id: uuid(),
          children: [],
          type: "play",
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
      <SortableFunctionDisplay functionTree={functionTree} />
    </FunctionEditorContext>
  );
}
