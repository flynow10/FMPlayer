import { UploadFileBody } from "api-lib/_upload-types";
import { fetchFile } from "@/src/utils/fetchFile";
import { useAsyncLoad } from "@/src/utils/useAsyncLoad";
import { fileTypeFromBuffer } from "@/src/utils/file-type";

export type FileUploadProps = {
  data:
    | {
        uploadType: FileUploadType.Url;
        url: string;
      }
    | {
        uploadType: FileUploadType.File;
        files: File[];
      };
};

export enum FileUploadType {
  File,
  Url,
}

export type PreUploadSong = {
  data: Uint8Array;
} & UploadFileBody;

export default function FileUpload(props: FileUploadProps) {
  const [files, loaded] = useAsyncLoad<PreUploadSong[]>(
    async () => {
      const songFromData = async (data: Uint8Array): Promise<PreUploadSong> => {
        const fileType = await fileTypeFromBuffer(data);
        if (fileType === undefined) {
          throw new Error("Failed to extract file type from uploaded data");
        }
        return {
          data,
          file: fileType,
          metadata: {},
        };
      };
      switch (props.data.uploadType) {
        case FileUploadType.File: {
          return Promise.all(
            props.data.files.map(async (file) => {
              const data = await songFromData(await fetchFile(file));
              return data;
            })
          );
        }
        case FileUploadType.Url: {
          return [await songFromData(await fetchFile(props.data.url))];
        }
      }
    },
    [],
    [props.data]
  );
  return (
    <span>
      {JSON.stringify(
        files.map((song) => ({ file: song.file, metadata: song.metadata }))
      )}
    </span>
  );
}
