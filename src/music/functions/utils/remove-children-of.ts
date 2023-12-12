import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function removeChildrenOf(
  flatTree: Functions.FlattenedActionState[],
  ids: UniqueIdentifier[]
) {
  const excludedParentIds = [...ids];

  return flatTree.filter((item) => {
    if (item.parentId && excludedParentIds.includes(item.parentId)) {
      if (item.childNodes.length > 0) {
        excludedParentIds.push(item.id);
      }
      return false;
    }
    return true;
  });
}
