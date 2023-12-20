import { useMemo } from "react";

import { flattenTree } from "@/src/music/functions/core/flatten-tree";
import { removeChildrenOf } from "@/src/music/functions/utils/remove-children-of";
import { Functions } from "@/src/types/functions";

import { UniqueIdentifier } from "@dnd-kit/core";

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
