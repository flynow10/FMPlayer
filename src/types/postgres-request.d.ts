import { FileType } from "@/src/types/file-type";
import { Music } from "@/src/types/music";
import { InvokeCommandOutput } from "@aws-sdk/client-lambda";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { Album, Song } from "@prisma/client";

export namespace PostgresRequest {
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
    songCount: number;
    albumCount: number;
  };

  export type GenreMediaResponse = {
    genre: string;
    songs: Song[];
    albums: Album[];
  };

  export type ArtistListResponse = {
    artist: string;
    songCount: number;
    albumCount: number;
  };

  export type UploadFileBody = {
    file: FileType.FileTypeResult;
    metadata: Music.Files.EditableMetadata;
  };

  export type UploadFileResponse = {
    song: Song;
    post: PresignedPost;
  };

  export type DownloadYoutubeVideoBody = {
    video: {
      id: string;
    };
    metadata: Music.Files.EditableMetadata;
  };

  export type DownloadYoutubeVideoResponse = {
    song: Song;
    output: InvokeCommandOutput;
  };
}
