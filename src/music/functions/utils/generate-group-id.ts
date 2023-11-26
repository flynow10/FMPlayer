import { Functions } from "@/src/types/functions";
import { v4 as uuid } from "uuid";

export function generateGroupId(group: Functions.DraggingGroup) {
  return `${group}-${uuid()}`;
}
