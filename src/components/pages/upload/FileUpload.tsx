import { UploadFileBody } from "api-lib/_upload-types";
import { fetchFile } from "@/src/utils/fetchFile";
import { useAsyncLoad } from "@/src/utils/useAsyncLoad";
import { fileTypeFromBuffer } from "@/src/utils/file-type";
import * as jsmediatags from "jsmediatags";
import { v4 as uuid } from "uuid";
import { useState } from "react";
import { FullCover } from "../LoadingPages";
import classNames from "classnames";
import { CheckSquare, Square } from "lucide-react";

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
  tempId: string;
  checked: boolean;
  data: Uint8Array;
} & UploadFileBody;

export default function FileUpload(props: FileUploadProps) {
  const [files, loaded, setFiles] = useAsyncLoad<PreUploadSong[]>(
    async () => {
      const songFromData = async (data: Uint8Array): Promise<PreUploadSong> => {
        const fileType = await fileTypeFromBuffer(data);
        if (fileType === undefined) {
          throw new Error("Failed to extract file type from uploaded data");
        }
        return {
          tempId: uuid(),
          checked: false,
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
              jsmediatags.read(new Blob([data.data]), {
                onSuccess: (tags) => {
                  console.log(tags);
                },
                onError: (error) => {
                  console.warn(error);
                },
              });
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

  const [lastSelectedFile, setLastSelectedFile] = useState("");

  // Allows the user to select use shift to select all files between the current and last selected files
  const onSelectFile = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    file: PreUploadSong,
    fileIndex: number
  ) => {
    // Set all files to the inverse of the current selected file
    const newCheckValue = !file.checked;
    setFiles((prev) => {
      const filesToFlip: string[] = [];
      let startIndex = prev.findIndex((findFile) => {
        return findFile.tempId === lastSelectedFile;
      });
      if (!event.shiftKey || startIndex === -1) {
        // Normal select / same file selected with shift
        filesToFlip.push(file.tempId);
      } else {
        // Swap if selecting up instead of down
        let endIndex = fileIndex;
        if (startIndex > endIndex) {
          const temp = startIndex;
          startIndex = endIndex;
          endIndex = temp;
        }
        for (let i = startIndex; i <= endIndex; i++) {
          filesToFlip.push(prev[i].tempId);
        }
      }
      return prev.map((mapFile) => {
        // Keep other files the same
        if (!filesToFlip.includes(mapFile.tempId)) return mapFile;
        return {
          ...mapFile,
          checked: newCheckValue,
        };
      });
    });
    setLastSelectedFile(file.tempId);
  };
  if (!loaded) {
    return <FullCover />;
  }
  return (
    <div className="grid grid-rows-1 grid-cols-10 h-full">
      <div className="flex flex-col col-span-3 h-full">
        <div className="grow flex flex-col overflow-auto border-b-2">
          {files.map((file, fileIndex) => {
            return (
              <div
                key={file.tempId}
                className={classNames(
                  {
                    "bg-blue-200": file.checked,
                    "border-blue-100": file.checked,
                  },
                  "shrink-0",
                  "last:border-b-0",
                  "border-b-2",
                  "overflow-hidden",
                  "whitespace-nowrap",
                  "overflow-ellipsis",
                  "p-3"
                )}
              >
                <div className="flex">
                  <div
                    className="m-2 outline-none"
                    onClick={(e) => {
                      onSelectFile(e, file, fileIndex);
                    }}
                  >
                    {file.checked ? <CheckSquare /> : <Square />}
                  </div>
                  {/* <input
                    id={file.tempId}
                    type="checkbox"
                    className="m-2 outline-none"
                    checked={file.checked}
                    onClick={(e) => {
                      onSelectFile(e, file, fileIndex);
                    }}
                  /> */}
                  <div className="">
                    <span className="block">
                      {file.metadata.title || "Unnamed Song"}
                    </span>
                    <span className="block text-xs font-light text-gray-400">
                      {file.file.mime}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="text-white m-4 rounded-lg btn success border-2">
          Upload selected files
        </button>
      </div>
      <div className="h-full border-l-2 col-span-7 row-span-6 whitespace-pre-wrap overflow-auto">
        {JSON.stringify(
          files.map((song) => ({ file: song.file, metadata: song.metadata })),
          null,
          2
        )}
      </div>
    </div>
  );
}
