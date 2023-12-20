import { createContext } from "react";

import { Music } from "@/src/types/music";

export const FileContext = createContext<Music.Files.NewTrackMetadata | null>(
  null
);
