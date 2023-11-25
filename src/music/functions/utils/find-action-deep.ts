import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function findActionDeep(
  tree: Functions.FunctionTree,
  searchId: UniqueIdentifier
): Functions.ActionState | undefined {
  for (const action of tree) {
    const { id, children } = action;

    if (id === searchId) {
      return action;
    }

    if (children.length) {
      const child = findActionDeep(children, searchId);

      if (child) {
        return child;
      }
    }
  }
  return undefined;
}
