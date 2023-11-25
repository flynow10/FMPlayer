import ActionList from "@/src/components/functions/ActionList";
import { IndentationWidth } from "@/src/components/functions/FunctionEditorContext";
import SortableAction from "@/src/components/functions/SortableAction";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { getDropProjection } from "@/src/music/functions/utils/get-drop-projection";
import { Functions } from "@/src/types/functions";
import {
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useMemo } from "react";
import { createPortal } from "react-dom";

type SortableFunctionDisplayProps = {
  functionTree: Functions.FunctionTree;
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

export default function SortableFunctionDisplay({
  functionTree,
}: SortableFunctionDisplayProps) {
  const { activeId, overId, offsetLeft } = useContext(FunctionEditor);

  const flattenedActions = useFlattenedTree(functionTree, activeId);
  const sortedIds = useMemo(
    () => flattenedActions.map(({ id }) => id),
    [flattenedActions]
  );

  const projectedDrop =
    activeId && overId
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
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeId && activeAction ? (
            <SortableAction
              id={activeAction.id}
              action={activeAction}
              depth={activeAction.depth}
              clone
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </SortableContext>
  );
}
