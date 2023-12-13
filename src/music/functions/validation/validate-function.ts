import { preValidateTree } from "@/src/music/functions/validation/pre-validate";
import { validateStatement } from "@/src/music/functions/validation/validate-statement";
import { Functions } from "@/src/types/functions";

export function validateFunction(
  functionTree: unknown
): functionTree is Functions.FunctionTree {
  // Pre check
  if (!Array.isArray(functionTree)) {
    return false;
  }

  if (!preValidateTree(functionTree, "actions")) {
    return false;
  }

  // Check for completeness

  for (const action of functionTree) {
    if (!validateStatement(action, "actions")) {
      return false;
    }
  }

  return true;
}
