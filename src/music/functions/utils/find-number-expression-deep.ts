import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function findNumberExpressionDeep(
  tree: Functions.FunctionTree,
  searchId: UniqueIdentifier
): Functions.NumberExpression | undefined {
  for (const action of tree) {
    const { children, type } = action;

    if (type === "loop" && action.numberExpression?.id === searchId) {
      return action.numberExpression;
    }

    if (children.length) {
      const child = findNumberExpressionDeep(children, searchId);

      if (child) {
        return child;
      }
    }
  }
  return undefined;
}
