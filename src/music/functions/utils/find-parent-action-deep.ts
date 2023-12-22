import { Functions } from "@/src/types/functions";

import { UniqueIdentifier } from "@dnd-kit/core";

export function findParentActionDeep(
  tree: Functions.FunctionTree,
  searchId: UniqueIdentifier
): Functions.ActionState | undefined {
  const result = findParent(tree, searchId);
  if (result === "none" || result === "parent") {
    return undefined;
  } else {
    return result;
  }
}

function findParent(
  tree: Functions.NullableTree,
  searchId: UniqueIdentifier
): Functions.ActionState | "none" | "parent" {
  for (const action of tree) {
    if (!action) {
      continue;
    }
    const { id, childNodes, numberExpressions, trackExpressions } = action;

    if (id === searchId) {
      return "parent";
    }
    let child: Functions.ActionState | "none" | "parent" = "none";
    if (childNodes.length) {
      child = findParent(childNodes, searchId);
    }

    if (numberExpressions.length && child === "none") {
      child = findParent(numberExpressions, searchId);
    }

    if (trackExpressions.length && child === "none") {
      child = findParent(trackExpressions, searchId);
    }

    if (child === "parent") {
      return action;
    } else if (child !== "none") {
      return child;
    }
  }
  return "none";
}
