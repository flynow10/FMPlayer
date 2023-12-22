import { ReactNode } from "react";

import { TRASH_ID } from "@/src/music/functions/core/constants";
import { Functions } from "@/src/types/functions";

import { useDroppable } from "@dnd-kit/core";

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
