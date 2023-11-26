import { TRASH_ID } from "@/src/components/functions/FunctionEditorContext";
import { Functions } from "@/src/types/functions";
import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

type TrashProps = {
  children: (isOver: boolean, ref: React.Ref<HTMLDivElement>) => ReactNode;
};

export default function Trash(props: TrashProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: TRASH_ID,
    data: {
      group: "trash" as Functions.DraggingGroup,
    },
  });
  return props.children(isOver, setNodeRef);
}
