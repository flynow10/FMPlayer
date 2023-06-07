export type SortType = "asc" | "desc";
export type SongSortFields = "title" | "artist" | "genre";
export type AlbumSortFields = "title" | "artist" | "genre";

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
