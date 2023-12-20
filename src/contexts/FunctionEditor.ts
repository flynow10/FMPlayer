import { createContext } from "react";

import { Functions } from "@/src/types/functions";

export const FunctionEditor = createContext<Functions.FunctionContext | null>(
  null
);
