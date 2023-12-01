import { Functions } from "@/src/types/functions";
import { createContext } from "react";

export const FunctionEditor = createContext<Functions.FunctionContext | null>(
  null
);
