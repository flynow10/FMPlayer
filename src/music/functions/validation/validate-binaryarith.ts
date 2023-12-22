import { Functions } from "@/src/types/functions";

export function validateBinaryArith(action: Functions.ActionState): boolean {
  if (
    action.trackExpressions.length !== 0 &&
    action.numberExpressions.length !== 2 &&
    action.childNodes.length !== 0
  ) {
    return false;
  }
  return true;
}
