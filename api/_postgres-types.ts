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

export type SongListOptions = {
  page: number;
  limit: number;
  sort: SortType;
  sortBy: SongSortFields;
};

export type AlbumListOptions = {
  page: number;
  limit: number;
  sort: SortType;
  sortBy: AlbumSortFields;
};
