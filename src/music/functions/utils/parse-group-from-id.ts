import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function parseGroupFromId(
  id: UniqueIdentifier | null
): Functions.DraggingGroup | null {
  if (typeof id !== "string") {
    return null;
  }
  const group = id.split("-")[0];
  return group as Functions.DraggingGroup;
}
