export type ID = string;

export type IAuthoredWork = {
  id: ID;
  title: string;
  artists?: string[];
  featuring?: string[];
};

export interface IMedia {
  getMediaType(): MediaType;
}

export interface ICoverImage {
  id: ID;
  title: string;
  coverUrl?: string;
}

export enum MediaType {
  Song,
  Album,
  Playlist,
}

export type FileType = "mp3" | "webm" | "m4a";
