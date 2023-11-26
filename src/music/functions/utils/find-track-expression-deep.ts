import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

export function findTrackExpressionDeep(
  tree: Functions.FunctionTree,
  searchId: UniqueIdentifier
): Functions.TrackExpression | undefined {
  for (const action of tree) {
    const { children, type } = action;

    if (type === "play" && action.trackExpression?.id === searchId) {
      return action.trackExpression;
    }

    if (children.length) {
      const child = findTrackExpressionDeep(children, searchId);

      if (child) {
        return child;
      }
    }
  }
  return undefined;
}
