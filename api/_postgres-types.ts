import { Album, Song } from "@prisma/client";

export type SortType = "asc" | "desc";
export type SongSortFields =
  | "title"
  | "artists"
  | "genre"
  | "modifiedOn"
  | "createdOn";
export type AlbumSortFields =
  | "title"
  | "artists"
  | "genre"
  | "modifiedOn"
  | "createdOn";

export type PaginationOptions = {
  page: number;
  limit: number;
  sortDirection: SortType;
  sortBy: string;
};

export type SongListOptions = PaginationOptions & {
  sortBy: SongSortFields;
};

export type AlbumListOptions = PaginationOptions & {
  sortBy: AlbumSortFields;
};

export type GenreListResponse = {
  genre: string;
  song_count: number;
  album_count: number;
};

export type GenreMediaResponse = {
  genre: string;
  songs: Song[];
  albums: Album[];
};
