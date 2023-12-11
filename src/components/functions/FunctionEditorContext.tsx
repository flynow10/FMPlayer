import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { buildTree } from "@/src/music/functions/utils/build-tree";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { cutFlatTree } from "@/src/music/functions/utils/cut-flat-tree";
import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
import { getDropProjection } from "@/src/music/functions/utils/get-drop-projection";
import { parseId } from "@/src/music/functions/utils/parse-id";
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
  const activeGroup = parseId(id).group;
  const filterMethod = (collision: Collision) => {
    if (collision.id === TRASH_ID || typeof collision.id !== "string") {
      return false;
    }
    if (activeGroup === parseId(collision.id).group) {
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
  const [activeGroup, setActiveGroup] =
    useState<Functions.DraggingGroup | null>(null);
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
    const group = parseId(active.id).group;
    setActiveGroup(group);
    setActiveId(active.id);
    setOverId(active.id);

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ active, delta }: DragMoveEvent) {
    if (
      typeof active.id === "string" &&
      parseId(active.id).group === "actions"
    ) {
      setOffsetLeft(delta.x);
    }
  }

  function handleDragOver({ over }: DragOverEvent) {
    if (over && over.id === TRASH_ID) {
      setOverId(null);
    } else {
      const overId = over?.id ?? null;
      if (typeof overId === "string" && activeGroup === parseId(overId).group) {
        setOverId(overId);
      } else {
        setOverId(null);
      }
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();
    if (typeof active.id !== "string") {
      return;
    }
    // Handle dropping action in trash
    if (over && over.id === TRASH_ID) {
      let flattenedActions = flattenTree(functionTree);
      if (activeGroup === "actions") {
        flattenedActions = cutFlatTree(flattenedActions, active.id);
      }
      if (activeGroup === "tracks") {
        flattenedActions = flattenedActions.map((flatAction) => {
          if (
            flatAction.type === "play" &&
            flatAction.trackExpression &&
            flatAction.trackExpression.id === active.id
          ) {
            return {
              ...flatAction,
              trackExpression: null,
            };
          }
          return flatAction;
        });
      }
      if (activeGroup === "numbers") {
        flattenedActions = flattenedActions.map((flatAction) => {
          if (
            flatAction.type === "loop" &&
            flatAction.numberExpression &&
            flatAction.numberExpression.id === active.id
          ) {
            return {
              ...flatAction,
              numberExpression: null,
            };
          }
          return flatAction;
        });
      }
      const newTree = buildTree(flattenedActions);
      setFunctionTree(newTree);
      return;
    }

    const overId = over?.id ?? null;
    if (typeof overId !== "string") {
      return;
    }
    const overData = parseId(overId);
    if (overId && activeGroup !== null && activeGroup !== overData.group) {
      return;
    }

    const clonedActions: Functions.FlattenedActionState[] = JSON.parse(
      JSON.stringify(flattenTree(functionTree))
    );
    if (!over || typeof over.id !== "string") {
      return;
    }

    if (activeGroup === "actions" && projectedDrop) {
      const { depth, parentId } = projectedDrop;

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
      return;
    }

    const overParentId = overData.parentId ?? "";
    const overAction = clonedActions.find(({ id }) => id === overParentId);

    if (activeGroup === "numbers") {
      const originalAction = clonedActions.find(
        (action) =>
          action.type === "loop" && action.numberExpression?.id === active.id
      );
      if (overAction && overAction.type === "loop") {
        let numberExpression: Functions.NumberExpression;
        if (
          originalAction &&
          originalAction.type === "loop" &&
          originalAction.numberExpression !== null
        ) {
          numberExpression = originalAction.numberExpression;
          originalAction.numberExpression = null;
        } else {
          const activeData = parseId(active.id);
          numberExpression =
            createEmpty.numbers[
              activeData.type as Functions.NumberExpressionType
            ]();
          numberExpression.id = active.id;
        }
        overAction.numberExpression = numberExpression;
        const newActions = buildTree(clonedActions);
        setFunctionTree(newActions);
      }
    }

    if (activeGroup === "tracks") {
      const originalAction = clonedActions.find(
        (action) =>
          action.type === "play" && action.trackExpression?.id === active.id
      );
      if (overAction && overAction.type === "play") {
        let trackExpression: Functions.TrackExpression = {
          id: active.id,
          trackId: "",
          type: "literal",
        };
        if (
          originalAction &&
          originalAction.type === "play" &&
          originalAction.trackExpression !== null
        ) {
          trackExpression = originalAction.trackExpression;
          originalAction.trackExpression = null;
        }
        overAction.trackExpression = trackExpression;
        const newActions = buildTree(clonedActions);
        setFunctionTree(newActions);
      }
      return;
    }
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
