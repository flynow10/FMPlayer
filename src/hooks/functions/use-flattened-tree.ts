import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
import { removeChildrenOf } from "@/src/music/functions/utils/remove-children-of";
import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useMemo } from "react";

export function useFlattenedTree(
  functionTree: Functions.FunctionTree,
  activeId: UniqueIdentifier | null
) {
  return useMemo(() => {
    const flatTree = flattenTree(functionTree);
    if (activeId) {
      return removeChildrenOf(flatTree, [activeId]);
    }
    return flatTree;
  }, [activeId, functionTree]);
}
