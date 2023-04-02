export type ID = string;

export type AuthoredWork = {
  id: ID;
  title: string;
  artists?: string[];
  featuring?: string[];
};

export type FileType = "mp3" | "webm";
