import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { buildTree } from "@/src/music/functions/utils/build-tree";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { cutFlatTree } from "@/src/music/functions/utils/cut-flat-tree";
import { deleteExpression } from "@/src/music/functions/utils/delete-expression";
import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { findParentActionDeep } from "@/src/music/functions/utils/find-parent-action-deep";
import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
import { getDropProjection } from "@/src/music/functions/utils/get-drop-projection";
import { parseActionId } from "@/src/music/functions/utils/parse-action-id";
import { parseDropId } from "@/src/music/functions/utils/parse-drop-id";
import { Functions } from "@/src/types/functions";
import {
  Collision,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
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
  const id = args.active.id;
  if (typeof id !== "string") {
    return [];
  }
  const activeGroup = parseActionId(id).group;
  const filterMethod = (collision: Collision) => {
    if (collision.id === TRASH_ID || typeof collision.id !== "string") {
      return false;
    }
    if (activeGroup === parseDropId(collision.id).group) {
      return true;
    }
    return false;
  };
  if (activeGroup === "actions") {
    const rectIds = args.droppableRects.keys();
    for (const rectId of rectIds) {
      const oldRect = args.droppableRects.get(rectId);
      if (oldRect && rectId !== TRASH_ID) {
        args.droppableRects.set(rectId, {
          ...oldRect,
          width: 10000,
          left: 0,
          right: 10000,
        });
      }
    }
  }
  return rectIntersection(args).filter(filterMethod);
};

export default function FunctionEditorContext({
  functionTree,
  setFunctionTree,
  children,
}: FunctionEditorContextProps) {
  const [activeGroup, setActiveGroup] = useState<Functions.ActionGroup | null>(
    null
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const flattenedActions = useFlattenedTree(functionTree, activeId);
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

  return (
    <FunctionEditor.Provider
      value={{
        activeGroup,
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
    if (typeof active.id !== "string") {
      return;
    }
    const group = parseActionId(active.id).group;
    setActiveGroup(group);
    setActiveId(active.id);
    setOverId(active.id);

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ active, delta }: DragMoveEvent) {
    if (
      typeof active.id === "string" &&
      parseActionId(active.id).group === "actions"
    ) {
      setOffsetLeft(delta.x);
    }
  }

  function handleDragOver({ over }: DragOverEvent) {
    if (over && over.id === TRASH_ID) {
      setOverId(null);
    } else {
      const overId = over?.id ?? null;
      if (
        typeof overId === "string" &&
        activeGroup === parseDropId(overId).group
      ) {
        setOverId(overId);
      } else {
        setOverId(null);
      }
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();
    if (!activeId || typeof activeId !== "string" || activeGroup === null) {
      return;
    }
    // Handle dropping action in trash
    if (over && over.id === TRASH_ID) {
      if (activeGroup === "actions") {
        let flattenedActions = flattenTree(functionTree);
        flattenedActions = cutFlatTree(flattenedActions, activeId);
        const newTree = buildTree(flattenedActions);
        setFunctionTree(newTree);
        return;
      }
      const clonedActions = JSON.parse(JSON.stringify(functionTree));
      const parent = findParentActionDeep(clonedActions, activeId);
      if (!parent) {
        return;
      }
      deleteExpression(
        parent,
        activeGroup === "numbers" ? "numberExpressions" : "trackExpressions",
        activeId
      );
      setFunctionTree(clonedActions);
      return;
    }

    if (!over || typeof over.id !== "string") {
      return;
    }

    const overId = over.id;
    const overData = parseDropId(overId);
    if (activeGroup !== overData.group) {
      return;
    }

    const clonedActions = JSON.parse(JSON.stringify(functionTree));

    if (activeGroup === "actions" && projectedDrop) {
      const clonedActionsFlat: Functions.FlattenedActionState[] =
        flattenTree(clonedActions);

      const { depth, parentId } = projectedDrop;

      const overIndex = clonedActionsFlat.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedActionsFlat.findIndex(
        ({ id }) => id === active.id
      );
      const activeTreeItem = clonedActionsFlat[activeIndex];

      clonedActionsFlat[activeIndex] = {
        ...activeTreeItem,
        depth,
        parentId,
      };
      const sortedActions = arrayMove(
        clonedActionsFlat,
        activeIndex,
        overIndex
      );
      const newActions = buildTree(sortedActions);

      setFunctionTree(newActions);
      return;
    }

    let currentAction = findActionDeep(clonedActions, activeId);
    const activeParent = findParentActionDeep(clonedActions, activeId);

    if (currentAction === undefined) {
      const activeData = parseActionId(activeId);
      currentAction = createEmpty[activeData.type]();
      currentAction.id = activeId;
    }

    const overParentId = overData.parentId;
    const overIndex = overData.index;
    const overParent = findActionDeep(clonedActions, overParentId);
    if (!overParent) {
      return;
    }

    switch (activeGroup) {
      case "numbers": {
        if (activeParent !== undefined) {
          deleteExpression(activeParent, "numberExpressions", currentAction.id);
        }
        overParent.numberExpressions[overIndex] = currentAction;
        break;
      }
      case "tracks": {
        if (activeParent !== undefined) {
          deleteExpression(activeParent, "trackExpressions", currentAction.id);
        }
        overParent.trackExpressions[overIndex] = currentAction;
        break;
      }
    }

    setFunctionTree(clonedActions);
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setActiveGroup(null);
    setActiveId(null);
    setOverId(null);
    setOffsetLeft?.(0);

    document.body.style.setProperty("cursor", "");
  }
}
