import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { buildTree } from "@/src/music/functions/utils/build-tree";
import { cutFlatTree } from "@/src/music/functions/utils/cut-flat-tree";
import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
import { getDropProjection } from "@/src/music/functions/utils/get-drop-projection";
import { parseGroupFromId } from "@/src/music/functions/utils/parse-group-from-id";
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
  const filteredCollisions = rectIntersection(args).filter((collision) => {
    if (collision.id === TRASH_ID) {
      return false;
    }
    if (parseGroupFromId(args.active.id) === parseGroupFromId(collision.id)) {
      return true;
    }
    return false;
  });
  return filteredCollisions;
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
    const group = parseGroupFromId(active.id);
    if (group) {
      setActiveGroup(group);
      setActiveId(active.id);
      setOverId(active.id);

      document.body.style.setProperty("cursor", "grabbing");
    }
  }

  function handleDragMove({ active, delta }: DragMoveEvent) {
    if (parseGroupFromId(active.id) === "actions") {
      setOffsetLeft(delta.x);
    }
  }

  function handleDragOver({ over }: DragOverEvent) {
    if (over && over.id === TRASH_ID) {
      setOverId(null);
    } else {
      const overId = over?.id ?? null;
      if (activeGroup === parseGroupFromId(overId)) {
        setOverId(overId);
      } else {
        setOverId(null);
      }
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

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
      const newTree = buildTree(flattenedActions);
      setFunctionTree(newTree);
      return;
    }

    const overId = over?.id ?? null;
    const overGroup = parseGroupFromId(overId);
    if (overId && activeGroup !== null && activeGroup !== overGroup) {
      return;
    }

    const clonedActions: Functions.FlattenedActionState[] = JSON.parse(
      JSON.stringify(flattenTree(functionTree))
    );

    if (activeGroup === "tracks" && over && typeof over.id === "string") {
      const overActionId = over.id.split("-").slice(1).join("-");
      const overAction = clonedActions.find(({ id }) => id === overActionId);
      const originalAction = clonedActions.find(
        (action) =>
          action.type === "play" && action.trackExpression?.id === active.id
      );
      if (overAction && overAction.type === "play") {
        let trackExpression: Functions.TrackExpression = {
          id: active.id,
          trackId: "",
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

    if (projectedDrop && over) {
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
