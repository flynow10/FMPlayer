import Action from "@/src/components/functions/Action";
import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

type SortableActionProps = {
  id: UniqueIdentifier;
  action: Functions.ActionState;
  setAction: Functions.SetAction<Functions.ActionState>;
  depth: number;
  clone: boolean;
  childCount?: number;
};

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export default function SortableAction(props: SortableActionProps) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setDraggableNodeRef,
    setDroppableNodeRef,
  } = useSortable({
    id: `${props.id}`,
    animateLayoutChanges,
  });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <Action
      wrapperRef={setDroppableNodeRef}
      ref={setDraggableNodeRef}
      action={props.action}
      setAction={props.setAction}
      clone={props.clone}
      depth={props.depth}
      ghost={isDragging}
      inToolBox={false}
      style={style}
      childCount={props.childCount}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
    />
  );
}
