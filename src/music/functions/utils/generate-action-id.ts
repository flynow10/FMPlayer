import { Functions } from "@/src/types/functions";
import { v4 as uuid } from "uuid";

export function generateActionId(
  group: Functions.ActionGroup,
  type: Functions.ActionType,
  id?: string
) {
  return `${group}_${type}_${id !== undefined ? id : uuid()}`;
}
