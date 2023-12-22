import { removeChildrenOf } from "@/src/music/functions/utils/remove-children-of";
import { Functions } from "@/src/types/functions";

import { UniqueIdentifier } from "@dnd-kit/core";

export function cutFlatTree(
  flatTree: Functions.FlattenedActionState[],
  cutId: UniqueIdentifier
) {
  return removeChildrenOf(flatTree, [cutId]).filter(({ id }) => id !== cutId);
}
