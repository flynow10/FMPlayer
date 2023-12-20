import { useContext, useState } from "react";

import { FileContext } from "@/src/contexts/FileContext";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";

import classNames from "classnames";
import { Check, CheckSquare, Loader2, MinusSquare, Square } from "lucide-react";

type FileListProps = {
  files: Music.Files.NewTrackMetadata[];
  selectedFiles: string[];
  ableToSelect: boolean;
  fileStatuses: Pages.Upload.FileStatus[];
  onOpenFile: (fileId: string) => void;
  setSelectedFile: (fileId: string, selected: boolean) => void;
};

export default function FileList(props: FileListProps) {
  const openFile = useContext(FileContext);
  const [lastSelectedFile, setLastSelectedFile] = useState("");

  const onSelectFile = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    file: Music.Files.NewTrackMetadata,
    fileIndex: number
  ) => {
    event.preventDefault();
    // Set all files to the inverse of the current selected file
    const newCheckValue = !props.selectedFiles.includes(file.id);
    const filesToFlip: string[] = [];
    let startIndex = props.files.findIndex((findFile) => {
      return findFile.id === lastSelectedFile;
    });

    if (!event.shiftKey || startIndex === -1) {
      // Normal select / same file selected with shift
      filesToFlip.push(file.id);
    } else {
      // Swap if selecting up instead of down
      let endIndex = fileIndex;

      if (startIndex > endIndex) {
        const temp = startIndex;
        startIndex = endIndex;
        endIndex = temp;
      }

      for (let i = startIndex; i <= endIndex; i++) {
        filesToFlip.push(props.files[i].id);
      }
    }

    filesToFlip.forEach((flipFile) => {
      props.setSelectedFile(flipFile, newCheckValue);
    });

    setLastSelectedFile(file.id);
  };

  return (
    <>
      <div className="shrink-0 border-b-2 flex">
        <div className="flex flex-col w-full">
          <span className="text-center p-1 text-gray-600 font-light text-sm">
            File List
          </span>
          <div
            className={
              (!props.ableToSelect ? "text-gray-500 " : "cursor-pointer ") +
              "flex ml-5 mb-2 outline-none w-fit"
            }
            onClick={(e) => {
              if (props.ableToSelect) {
                e.preventDefault();
                props.files.forEach((file) => {
                  props.setSelectedFile(
                    file.id,
                    props.selectedFiles.length === 0
                  );
                });
              }
            }}
          >
            {props.selectedFiles.length === 0 ? (
              <Square />
            ) : props.selectedFiles.length === props.files.length ? (
              <CheckSquare />
            ) : (
              <MinusSquare />
            )}
            <span className="ml-2 select-none">
              {props.selectedFiles.length === 0
                ? "Select all"
                : "Un-Select all"}
            </span>
          </div>
        </div>
      </div>
      <div className="grow flex flex-col overflow-auto border-b-2">
        {props.files.map((file, fileIndex) => {
          const status: Pages.Upload.FileStatus = props.fileStatuses.find(
            (s) => s.id === file.id
          ) ?? {
            id: file.id,
            status: "not queued",
          };
          let icon;
          let subText = file.artists.map((a) => a.name).join(", "); //= file.audioData.fileType.mime;

          switch (status.status) {
            case "waiting":
            case "not queued":
              if (status.status === "waiting") {
                subText = "Waiting to upload...";
              }

              icon = props.selectedFiles.includes(file.id) ? (
                <CheckSquare />
              ) : (
                <Square />
              );
              break;
            case "uploading":
              subText = "Uploading...";
              icon = <Loader2 className="animate-spin" />;
              break;
            case "uploaded":
              subText = "Completed";
              icon = <Check />;
              break;
          }

          return (
            <div
              key={file.id}
              className={classNames(
                {
                  "text-gray-500": !props.ableToSelect,
                  "bg-blue-300": file.id === openFile?.id,
                  "bg-blue-100":
                    props.selectedFiles.includes(file.id) &&
                    !(file.id === openFile?.id),
                  "border-blue-100":
                    props.selectedFiles.includes(file.id) ||
                    file.id === openFile?.id,
                },
                // "dark:invert",
                // "dark:text-white",
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
                  className={
                    "m-2 outline-none " +
                    (props.ableToSelect ? " cursor-pointer" : "")
                  }
                  onClick={(e) => {
                    if (props.ableToSelect) {
                      onSelectFile(e, file, fileIndex);
                    }
                  }}
                >
                  {icon}
                </div>
                <div
                  className="flex flex-col cursor-pointer overflow-hidden"
                  onClick={() => {
                    props.onOpenFile(file.id);
                  }}
                >
                  <span className="my-auto block overflow-auto no-scrollbar">
                    {file.title}
                  </span>
                  {subText.trim() !== "" && (
                    <span className="block text-xs font-light text-gray-800">
                      {subText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
