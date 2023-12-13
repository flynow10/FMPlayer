import { Functions } from "@/src/types/functions";

export function preValidateTree(
  functionTree: unknown[],
  group: Functions.ActionGroup
): functionTree is Functions.FunctionTree {
  for (const action of functionTree) {
    if (!action) {
      if (group !== "actions" && (action === undefined || action === null)) {
        continue;
      } else {
        return false;
      }
    }

    if (typeof action !== "object") {
      return false;
    }

    if (!preValidateAction(action)) {
      return false;
    }

    if (group !== action.group) {
      return false;
    }

    if (
      !preValidateTree(action.childNodes, "actions") ||
      !preValidateTree(action.trackExpressions, "tracks") ||
      !preValidateTree(action.numberExpressions, "numbers")
    ) {
      return false;
    }
  }
  return true;
}

// Source from SO https://stackoverflow.com/questions/49579094/typescript-conditional-types-filter-out-readonly-properties-pick-only-requir/49579497#49579497
// 13/12/23
type RequiredKeys<T> = {
  [K in keyof T]-?: object extends { [P in K]: T[K] } ? never : K;
}[keyof T];
type ExcludeOptionalProps<T> = Pick<T, RequiredKeys<T>>;

const requiredProperties: Record<
  keyof ExcludeOptionalProps<Functions.ActionState>,
  string
> = {
  id: "string",
  type: "string",
  group: "string",
  childNodes: "array",
  trackExpressions: "array",
  numberExpressions: "array",
};

export function preValidateAction(
  action: object
): action is Functions.ActionState {
  for (const [property, type] of Object.entries(requiredProperties)) {
    if (!(property in action)) {
      return false;
    }
    const value = (action as Record<string, unknown>)[property];
    if (type === "array") {
      if (!Array.isArray(value)) {
        return false;
      }
    } else if (typeof value !== type) {
      return false;
    }
  }
  return true;
}
