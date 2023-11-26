import { Functions } from "@/src/types/functions";

export function getActionName(type: Functions.ActionType): string {
  switch (type) {
    case "play":
      return "Play Tracks";
  }
  return type.slice(0, 1).toLocaleUpperCase() + type.slice(1);
}
