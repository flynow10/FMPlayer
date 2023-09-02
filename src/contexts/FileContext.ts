import { Music } from "@/src/types/music";
import { createContext } from "react";

export const FileContext = createContext<Music.Files.EditableMetadata | null>(
  null
);
