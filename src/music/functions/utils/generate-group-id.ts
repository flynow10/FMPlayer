import { Functions } from "@/src/types/functions";
import { v4 as uuid } from "uuid";

export function generateGroupId(
  group: Functions.DraggingGroup,
  type: string,
  parentId?: string,
  index?: number
) {
  let partialId = `${group}_${type}_${index !== undefined ? index : uuid()}`;
  if (parentId) {
    partialId += `_${parentId}`;
  }
  return partialId;
}
