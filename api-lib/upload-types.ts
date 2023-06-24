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
