import { createContext, useContext } from "react";

import { Pages } from "@/src/types/pages";

export const PageContext = createContext<Pages.PageContext | null>(null);

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (context === null) {
    throw new Error("Page was used outside of a context provider!");
  }
  return context;
};
