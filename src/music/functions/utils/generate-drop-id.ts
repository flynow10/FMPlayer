import { Functions } from "@/src/types/functions";

export function generateDropId(
  group: Functions.DraggingGroup,
  index: number,
  parentId: string
) {
  return `${group}_${index}_${parentId}`;
}
