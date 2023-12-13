import { Functions } from "@/src/types/functions";

export function validateLoop(action: Functions.ActionState): boolean {
  if (
    action.trackExpressions.length !== 0 ||
    action.numberExpressions.length !== 1 ||
    action.childNodes.length < 1
  ) {
    return false;
  }
  return true;
}
