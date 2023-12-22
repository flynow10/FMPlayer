import { Functions } from "@/src/types/functions";

// <group>_<index>_<parentId>

export function parseDropId(idString: string) {
  const splitId = idString.split("_");

  const [group, index, ...parentId] = splitId;

  return {
    parentId: parentId.join("_"),
    group: group as Functions.DraggingGroup,
    index: parseInt(index),
  };
}
