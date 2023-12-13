import { validateBinaryArith } from "@/src/music/functions/validation/validate-binaryarith";
import { validateLoop } from "@/src/music/functions/validation/validate-loop";
import { validateNumberLiteral } from "@/src/music/functions/validation/validate-numberliteral";
import { validatePlay } from "@/src/music/functions/validation/validate-play";
import { validateTrackLiteral } from "@/src/music/functions/validation/validate-trackliteral";
import { Functions } from "@/src/types/functions";

export function validateStatement(
  action: Functions.ActionState,
  expectedGroup: Functions.ActionGroup
): boolean {
  if (action.group !== expectedGroup) {
    return false;
  }
  for (const [group, list] of Object.entries({
    actions: action.childNodes,
    numbers: action.numberExpressions,
    tracks: action.trackExpressions,
  })) {
    for (const child of list) {
      if (child === null) {
        return false;
      }
      if (!validateStatement(child, group as Functions.ActionGroup)) {
        return false;
      }
    }
  }
  switch (action.type) {
    case "loop": {
      if (expectedGroup !== "actions") {
        return false;
      }
      return validateLoop(action);
    }
    case "play": {
      if (expectedGroup !== "actions") {
        return false;
      }
      return validatePlay(action);
    }
    case "binaryarith": {
      if (expectedGroup !== "numbers") {
        return false;
      }
      return validateBinaryArith(action);
    }
    case "numberliteral": {
      if (expectedGroup !== "numbers") {
        return false;
      }
      return validateNumberLiteral(action);
    }
    case "trackliteral": {
      if (expectedGroup !== "tracks") {
        return false;
      }
      return validateTrackLiteral(action);
    }
    default: {
      return false;
    }
  }
}
