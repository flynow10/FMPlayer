import { Functions } from "@/src/types/functions";

// <group>_<type>_<id>

export function parseActionId(idString: string): Functions.IdData {
  const splitId = idString.split("_");

  const [group, type, id] = splitId;

  return {
    group: group as Functions.ActionGroup,
    type: type as Functions.ActionType,
    id,
  };
}
