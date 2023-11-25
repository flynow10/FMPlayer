import { removeChildrenOf } from "@/src/music/functions/utils/remove-children-of";
import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function cutFlatTree(
  flatTree: Functions.FlattenedActionState[],
  id: UniqueIdentifier
) {
  return removeChildrenOf(flatTree, [id]).filter(({ id }) => id !== id);
}
