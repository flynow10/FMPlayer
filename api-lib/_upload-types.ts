import { FileTypeResult } from "@/src/utils/file-type/types";

export type UploadFileBody = { file: FileTypeResult; metadata: Metadata };
export type Metadata = {
  title?: string;
  genre?: string;
  artists?: string[] | string;
  featuring?: string[] | string;
  albumId?: string;
  trackNumber?: number;
};
