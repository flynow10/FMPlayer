import { Functions } from "@/src/types/functions";

// <draggableGroup>_<type>_<id>_<parentId>?

export function parseId(idString: string): Functions.IdData {
  const splitId = idString.split("_");

  const [group, type, id, ...parentId] = splitId;

  return {
    group: group as Functions.DraggingGroup,
    type,
    id,
    parentId: parentId.length === 0 ? undefined : parentId.join("_"),
  };
}
