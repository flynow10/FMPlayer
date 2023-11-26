import ActionList from "@/src/components/functions/ActionList";
import { IndentationWidth } from "@/src/components/functions/FunctionEditorContext";
import SortableAction from "@/src/components/functions/SortableAction";
import { fadeOutAnimationConfig } from "@/src/components/functions/utils/fade-out-animation";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { getChildCount } from "@/src/music/functions/utils/get-child-count";
import { getDropProjection } from "@/src/music/functions/utils/get-drop-projection";
import { Functions } from "@/src/types/functions";
import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useContext, useMemo } from "react";
import { createPortal } from "react-dom";

type SortableFunctionDisplayProps = {
  functionTree: Functions.FunctionTree;
};

export default function SortableFunctionDisplay({
  functionTree,
}: SortableFunctionDisplayProps) {
  const { activeId, overId, offsetLeft, activeGroup } =
    useContext(FunctionEditor);

  const flattenedActions = useFlattenedTree(functionTree, activeId);
  const sortedIds = useMemo(
    () => flattenedActions.map(({ id }) => id),
    [flattenedActions]
  );

  const projectedDrop =
    activeId && overId && activeGroup === "actions"
      ? getDropProjection(
          flattenedActions,
          activeId,
          overId,
          offsetLeft,
          IndentationWidth
        )
      : null;

  const activeAction = activeId
    ? flattenedActions.find(({ id }) => id === activeId)
    : null;
  return (
    <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
      <ActionList>
        {flattenedActions.map((action) => (
          <SortableAction
            key={action.id}
            id={action.id}
            action={action}
            clone={false}
            depth={
              action.id === activeId && projectedDrop
                ? projectedDrop.depth
                : action.depth
            }
          />
        ))}
      </ActionList>
      {createPortal(
        <DragOverlay
          modifiers={[restrictToWindowEdges]}
          dropAnimation={fadeOutAnimationConfig}
        >
          {activeId && activeAction && activeGroup === "actions" ? (
            <SortableAction
              id={activeAction.id}
              action={activeAction}
              depth={activeAction.depth}
              childCount={getChildCount(functionTree, activeAction.id) + 1}
              clone
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </SortableContext>
  );
}
