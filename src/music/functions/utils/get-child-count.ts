import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function getChildCount(
  tree: Functions.FunctionTree,
  id: UniqueIdentifier
) {
  const action = findActionDeep(tree, id);
  if (action) {
    return countChildren(action);
  }
  return 0;
}

export function countChildren(action: Functions.ActionState) {
  let count = 0;
  if (action.children) {
    for (const child of action.children) {
      count += countChildren(child) + 1;
    }
  }
  return count;
}
