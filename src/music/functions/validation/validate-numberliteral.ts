import { Functions } from "@/src/types/functions";

export function validateNumberLiteral(action: Functions.ActionState): boolean {
  if (
    action.trackExpressions.length !== 0 ||
    action.numberExpressions.length !== 0 ||
    action.childNodes.length !== 0
  ) {
    return false;
  }

  // Validate number literal data
  if (
    !action.data ||
    typeof action.data !== "object" ||
    !("value" in action.data) ||
    typeof action.data.value !== "number"
  ) {
    return false;
  }
  return true;
}
