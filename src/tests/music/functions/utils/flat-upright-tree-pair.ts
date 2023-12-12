import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { generateActionId } from "@/src/music/functions/utils/generate-action-id";
import { Functions } from "@/src/types/functions";
import { v4 as uuid } from "uuid";

export function createTreePair() {
  const tree: Functions.FunctionTree = [
    {
      id: generateActionId("actions", "loop"),
      group: "actions",
      type: "loop",
      numberExpressions: [
        {
          id: generateActionId("numbers", "numberliteral"),
          childNodes: [],
          group: "numbers",
          numberExpressions: [],
          trackExpressions: [],
          type: "numberliteral",
          data: {
            value: 0,
          },
        },
      ],
      childNodes: [
        {
          ...createEmpty.play(),
          trackExpressions: [
            {
              ...createEmpty.trackliteral(),
              data: {
                trackId: uuid(),
              },
            },
          ],
        },
      ],
      trackExpressions: [],
    },
  ];

  const flatTree: Functions.FlattenedActionState[] = [
    {
      ...tree[0],
      depth: 0,
      index: 0,
      parentId: null,
    },
    {
      ...tree[0].childNodes[0],
      depth: 1,
      index: 0,
      parentId: tree[0].id,
    },
  ];

  return {
    tree,
    flatTree,
  };
}
