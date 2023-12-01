import ActionList from "@/src/components/functions/ActionList";
import { IndentationWidth } from "@/src/components/functions/FunctionEditorContext";
import SortableAction from "@/src/components/functions/SortableAction";
import { fadeOutAnimationConfig } from "@/src/components/functions/utils/fade-out-animation";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { buildTree } from "@/src/music/functions/utils/build-tree";
import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
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
  setFunctionTree: Functions.SetFunctionTree;
};

export default function SortableFunctionDisplay({
  functionTree,
  setFunctionTree,
}: SortableFunctionDisplayProps) {
  const functionCtx = useContext(FunctionEditor);
  if (functionCtx === null) {
    throw new Error("Sortable list was used outside of a function context!");
  }
  const { activeId, overId, offsetLeft, activeGroup } = functionCtx;

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
            setAction={(value) => {
              setFunctionTree((prevTree) => {
                const clonedTree = JSON.parse(
                  JSON.stringify(flattenTree(prevTree))
                ) as Functions.FlattenedActionState[];
                let newAction: Functions.ActionState;
                const oldActionIndex = clonedTree.findIndex(
                  ({ id }) => id === action.id
                );
                const oldAction = clonedTree.find(({ id }) => id === action.id);
                if (!oldAction) {
                  throw new Error("Trying to set action that does not exist!");
                }
                if (typeof value === "function") {
                  newAction = value(oldAction);
                } else {
                  newAction = value;
                }
                clonedTree[oldActionIndex] = { ...oldAction, ...newAction };
                const newTree = buildTree(clonedTree);
                return newTree;
              });
            }}
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
              setAction={() => {}}
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
