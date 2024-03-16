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
  if (action.childNodes) {
    for (const child of action.childNodes) {
      count += countChildren(child) + 1;
    }
  }
  return count;
}

export function countActions(tree: Functions.FunctionTree) {
  let count = 0;

  for (const action of tree) {
    count += countChildren(action) + 1;
  }

  return count;
}
