import { fetchFile, getPreUploadSongFromData } from "@/src/utils/file-utils";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { useCallback, useState } from "react";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import classNames from "classnames";
import { CheckSquare, MinusSquare, Square } from "lucide-react";
import { PostgresRequest } from "@/src/types/postgres-request";
import { Pages } from "@/src/types/pages";
import { getFileNameFromUrl } from "@/src/utils/url-utils";
import BufferAudioPlayer from "@/src/components/utils/BufferAudioPlayer";
import { Upload } from "@/src/types/upload";
import MetadataEditor from "@/src/components/pages/upload/MetadataEditor";

export type FileUploadProps = {
  data: {
    uploadType: Pages.Upload.FileUploadType;
    url?: string;
    files?: File[];
  };
};

export type PreUploadSong = {
  tempId: string;
  data: Uint8Array;
} & PostgresRequest.UploadFileBody;

export default function FileUpload(props: FileUploadProps) {
  const [files, filesLoaded, setFiles] = useAsyncLoad<PreUploadSong[]>(
    async () => {
      let files: PreUploadSong[] = [];

      switch (props.data.uploadType) {
        case "file": {
          if (props.data.files === undefined) {
            throw new Error("Files missing from file upload");
          }

          files = await Promise.all(
            props.data.files.map(async (file) => {
              const fileName = file.name.replace(/\.[^/.]+$/, "");
              return await getPreUploadSongFromData(
                await fetchFile(file),
                fileName
              );
            })
          );
          break;
        }

        case "url": {
          if (props.data.url === undefined) {
            throw new Error("Url missing from url upload");
          }

          const fileName = getFileNameFromUrl(props.data.url);
          files = [
            await getPreUploadSongFromData(
              await fetchFile(props.data.url),
              fileName
            ),
          ];
          break;
        }
      }

      if (currentShowingFileId === "" && files.length > 0) {
        setCurrentShowingFileId(files[0].tempId);
      }

      return files;
    },
    [],
    [props.data]
  );

  const [currentShowingFileId, setCurrentShowingFileId] = useState("");
  const currentFile = files.find((f) => f.tempId === currentShowingFileId);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [lastSelectedFile, setLastSelectedFile] = useState("");

  // Allows the user to select use shift to select all files between the current and last selected files
  const onSelectFile = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    file: PreUploadSong,
    fileIndex: number
  ) => {
    event.preventDefault();
    // Set all files to the inverse of the current selected file
    const newCheckValue = !selectedFiles.includes(file.tempId);
    setSelectedFiles((prev) => {
      const filesToFlip: string[] = [];
      let startIndex = files.findIndex((findFile) => {
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
          filesToFlip.push(files[i].tempId);
        }
      }

      if (newCheckValue) {
        const newSelectedFiles = [...prev];
        filesToFlip.forEach((flipFile) => {
          if (!newSelectedFiles.includes(flipFile)) {
            newSelectedFiles.push(flipFile);
          }
        });
        return newSelectedFiles;
      } else {
        return prev.filter((mapFile) => {
          return !filesToFlip.includes(mapFile);
        });
      }
    });
    setLastSelectedFile(file.tempId);
  };

  const setFileMetadataProperty = useCallback<Upload.SetFileMetadataFunction>(
    (fileId, property, value) => {
      setFiles((prev) => {
        return prev.map((mapFiles) => {
          if (mapFiles.tempId !== fileId) {
            return {
              ...mapFiles,
            };
          }

          return {
            ...mapFiles,
            metadata: {
              ...mapFiles.metadata,
              [property]: value,
            },
          };
        });
      });
    },
    [setFiles]
  );

  if (!filesLoaded) {
    return <FullCover />;
  }

  return (
    <div className="grid grid-rows-1 grid-cols-10 h-full">
      <div className="flex flex-col col-span-3 h-full">
        <div className="shrink-0 border-b-2 flex">
          <div className="flex flex-col w-full">
            <span className="text-center p-1 text-gray-600 font-light text-sm">
              File List
            </span>
            <div
              className="cursor-pointer flex ml-5 mb-2 outline-none w-fit"
              onClick={(e) => {
                e.preventDefault();
                setSelectedFiles((prev) =>
                  prev.length === 0 ? files.map((f) => f.tempId) : []
                );
              }}
            >
              {selectedFiles.length === 0 ? (
                <Square />
              ) : selectedFiles.length === files.length ? (
                <CheckSquare />
              ) : (
                <MinusSquare />
              )}
              <span className="ml-2 select-none">
                {selectedFiles.length === 0 ? "Select all" : "Un-Select all"}
              </span>
            </div>
          </div>
        </div>
        <div className="grow flex flex-col overflow-auto border-b-2">
          {files.map((file, fileIndex) => {
            return (
              <div
                key={file.tempId}
                className={classNames(
                  {
                    "bg-blue-300": file.tempId === currentShowingFileId,
                    "bg-blue-100":
                      selectedFiles.includes(file.tempId) &&
                      !(file.tempId === currentShowingFileId),
                    "border-blue-100":
                      selectedFiles.includes(file.tempId) ||
                      file.tempId === currentShowingFileId,
                  },
                  "select-none",
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
                    className="m-2 outline-none cursor-pointer"
                    onClick={(e) => {
                      onSelectFile(e, file, fileIndex);
                    }}
                  >
                    {selectedFiles.includes(file.tempId) ? (
                      <CheckSquare />
                    ) : (
                      <Square />
                    )}
                  </div>
                  <div
                    className="flex flex-col cursor-pointer overflow-hidden"
                    onClick={() => {
                      setCurrentShowingFileId(file.tempId);
                    }}
                  >
                    <span className="block overflow-auto no-scrollbar">
                      {file.metadata.title}
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
      <div className="p-7 gap-2 h-full border-x-2 col-span-7 row-span-6 flex flex-col overflow-auto relative">
        {currentFile ? (
          <>
            <h3
              key={currentFile.tempId + "-Title"}
              className="text-xl relative box-border"
            >
              <input
                className="peer w-full focus:opacity-100 bg-transparent opacity-0 outline-none p-2"
                defaultValue={currentFile.metadata.title}
                placeholder={currentFile.metadata.title}
                onChange={(e) => {
                  setFileMetadataProperty(
                    currentFile.tempId,
                    "title",
                    e.target.value || "Untitled Song"
                  );
                }}
              />
              <span className="whitespace-pre peer-focus:text-transparent inline absolute left-0 top-0 -z-10 outline  outline-gray-200 outline-2 box-border rounded-lg p-2">
                {currentFile.metadata.title}
              </span>
            </h3>
            <BufferAudioPlayer
              key={currentFile.tempId + "-AudioPlayer"}
              data={currentFile.data}
            />
            <MetadataEditor
              files={files}
              currentFileId={currentShowingFileId}
              setFileMetadata={setFileMetadataProperty}
            />
            <div className="whitespace-pre-wrap">
              {JSON.stringify(
                {
                  tempId: currentFile.tempId,
                  file: currentFile.file,
                  metadata: currentFile.metadata,
                },
                null,
                2
              )}
            </div>
          </>
        ) : (
          <div>Pick a file</div>
        )}
      </div>
    </div>
  );
}
