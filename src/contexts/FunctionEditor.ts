import { Functions } from "@/src/types/functions";
import { createContext } from "react";

export const FunctionEditor = createContext<Functions.FunctionContext>({
  activeGroup: null,
  activeId: null,
  overId: null,
  offsetLeft: 0,
});
