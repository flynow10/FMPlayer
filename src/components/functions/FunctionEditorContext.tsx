import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { buildTree } from "@/src/music/functions/utils/build-tree";
import { cutFlatTree } from "@/src/music/functions/utils/cut-flat-tree";
import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
import { getDropProjection } from "@/src/music/functions/utils/get-drop-projection";
import { Functions } from "@/src/types/functions";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import React, { useState } from "react";

type FunctionEditorContextProps = {
  children?: React.ReactNode;
  functionTree: Functions.FunctionTree;
  setFunctionTree: Functions.SetFunctionTree;
};

// px width of nested actions indent
export const IndentationWidth = 40;

// Reserved IDs
export const TRASH_ID = "TRASH";

// Only drop trash actions when the mouse pointer is in the trash instead of closest center
const collisionDetection: CollisionDetection = (args) => {
  const pointerCollision = getFirstCollision(pointerWithin(args));
  const isInTrash = pointerCollision && pointerCollision.id === TRASH_ID;
  if (isInTrash) {
    return [{ id: TRASH_ID }];
  }
  const collisions = closestCenter(args);
  return collisions.filter(({ id }) => id !== TRASH_ID);
};

export default function FunctionEditorContext({
  functionTree,
  setFunctionTree,
  children,
}: FunctionEditorContextProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const flattenedActions = useFlattenedTree(functionTree, activeId);

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

  return (
    <FunctionEditor.Provider
      value={{
        activeId,
        overId,
        offsetLeft,
      }}
    >
      <DndContext
        sensors={sensors}
        measuring={{
          droppable: { strategy: MeasuringStrategy.Always },
        }}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndContext>
    </FunctionEditor.Provider>
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);
    setOverId(active.id);

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft?.(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    if (over && over.id === TRASH_ID) {
      setOverId(null);
    } else {
      setOverId(over?.id ?? null);
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    // Handle dropping action in trash
    if (over && over.id === TRASH_ID) {
      const flattentedActions = flattenTree(functionTree);
      const newTree = buildTree(cutFlatTree(flattentedActions, active.id));
      setFunctionTree(newTree);
      return;
    }

    if (projectedDrop && over) {
      const { depth, parentId } = projectedDrop;

      const clonedActions: Functions.FlattenedActionState[] = JSON.parse(
        JSON.stringify(flattenTree(functionTree))
      );
      const overIndex = clonedActions.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedActions.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedActions[activeIndex];

      clonedActions[activeIndex] = {
        ...activeTreeItem,
        depth,
        parentId,
      };
      const sortedActions = arrayMove(clonedActions, activeIndex, overIndex);
      const newActions = buildTree(sortedActions);

      setFunctionTree(newActions);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft?.(0);

    document.body.style.setProperty("cursor", "");
  }
}
