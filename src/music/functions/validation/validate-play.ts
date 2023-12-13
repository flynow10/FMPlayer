import { Functions } from "@/src/types/functions";

export function validatePlay(action: Functions.ActionState): boolean {
  if (
    action.trackExpressions.length !== 1 ||
    action.numberExpressions.length !== 0 ||
    action.childNodes.length !== 0
  ) {
    return false;
  }

  return true;
}
