import { BlockActions } from "@/src/music/functions/core/actions-types";
import { Functions } from "@/src/types/functions";

import { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function getDropProjection(
  actions: Functions.FlattenedActionState[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number
) {
  const overActionIndex = actions.findIndex(({ id }) => id === overId);
  const activeActionIndex = actions.findIndex(({ id }) => id === activeId);
  const activeAction = actions[activeActionIndex];
  const newActions = arrayMove(actions, activeActionIndex, overActionIndex);
  const previousAction = newActions[overActionIndex - 1];
  const nextAction = newActions[overActionIndex + 1];
  const dragDepth = Math.round(dragOffset / indentationWidth);
  const projectedDepth = activeAction.depth + dragDepth;
  const maxDepth = getMaxDepth();
  const minDepth = nextAction ? nextAction.depth : 0;
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousAction) {
      return null;
    }

    if (depth === previousAction.depth) {
      return previousAction.parentId;
    }

    if (depth > previousAction.depth) {
      return previousAction.id;
    }

    const newParent = newActions
      .slice(0, overActionIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;
    return newParent ?? null;
  }
  function getMaxDepth() {
    if (previousAction) {
      if (BlockActions.includes(previousAction.type)) {
        return previousAction.depth + 1;
      }
      return previousAction.depth;
    }
    return 0;
  }
}
