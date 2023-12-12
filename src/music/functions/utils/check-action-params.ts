import { Functions } from "@/src/types/functions";

export function checkActionParams(
  action: Functions.ActionState,
  trackExpressionCount: number,
  numberExpressionCount: number,
  canHaveChildNodes: boolean
): void {
  if (!canHaveChildNodes && action.childNodes.length > 0) {
    throw new Error(
      `Action "${action.type}" does not support children, but ${action.childNodes.length} were found!`
    );
  }

  if (action.trackExpressions.length > trackExpressionCount) {
    throw new Error(`Action "${action.type}" has too many track expressions!`);
  }

  if (action.numberExpressions.length > numberExpressionCount) {
    throw new Error(`Action "${action.type}" has too many track expressions!`);
  }
}
