import { BlockActions } from "@/src/music/functions/utils/actions-types";
import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function flattenTree(
  actions: Functions.ActionState[],
  parentId: UniqueIdentifier | null = null,
  depth = 0
): Functions.FlattenedActionState[] {
  return actions.reduce<Functions.FlattenedActionState[]>(
    (acc, action, index) => {
      return [
        ...acc,
        { ...action, parentId, depth, index },
        ...(BlockActions.includes(action.type)
          ? flattenTree(action.childNodes, action.id, depth + 1)
          : []),
      ];
    },
    []
  );
}
