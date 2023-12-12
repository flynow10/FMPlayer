import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function findActionDeep(
  tree: Functions.NullableTree,
  searchId: UniqueIdentifier
): Functions.ActionState | undefined {
  for (const action of tree) {
    if (!action) {
      continue;
    }
    const { id, childNodes, numberExpressions, trackExpressions } = action;

    if (id === searchId) {
      return action;
    }

    if (childNodes.length) {
      const child = findActionDeep(childNodes, searchId);

      if (child) {
        return child;
      }
    }

    if (numberExpressions.length) {
      const child = findActionDeep(numberExpressions, searchId);

      if (child) {
        return child;
      }
    }

    if (trackExpressions.length) {
      const child = findActionDeep(trackExpressions, searchId);

      if (child) {
        return child;
      }
    }
  }
  return undefined;
}
