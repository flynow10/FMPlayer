export namespace PostgresRequest {
  type Song = import("@prisma/client").Song;
  type Album = import("@prisma/client").Album;
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

  export type AlbumWithSongs = Album & {
    songs: Song[];
  };

  export type SongWithAlbum = Song & {
    album: Album | null;
  };

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
  export type UploadFileBody = {
    file: FileType.FileTypeResult;
    metadata: Metadata;
  };
  export type Metadata = {
    title?: string;
    genre?: string;
    artists?: string[] | string;
    featuring?: string[] | string;
    albumId?: string;
    trackNumber?: number;
  };
}
