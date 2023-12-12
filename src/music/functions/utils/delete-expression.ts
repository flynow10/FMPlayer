import { Functions } from "@/src/types/functions";

export function deleteExpression(
  action: Functions.ActionState,
  expressionType: "numberExpressions" | "trackExpressions",
  id: string
) {
  action[expressionType] = action[expressionType].map((action) =>
    !action || action.id !== id ? action : null
  ) as Functions.ActionState[];
}
