import { Functions } from "@/src/types/functions";

export function validateTrackLiteral(action: Functions.ActionState): boolean {
  if (
    action.trackExpressions.length !== 0 ||
    action.numberExpressions.length !== 0 ||
    action.childNodes.length !== 0
  ) {
    return false;
  }

  // Validate track literal data
  if (
    !action.data ||
    typeof action.data !== "object" ||
    !("trackId" in action.data) ||
    typeof action.data.trackId !== "string" ||
    action.data.trackId.length === 0
  ) {
    return false;
  }
  return true;
}
