import { fetchFile, getPreUploadFileFromData } from "@/src/utils/file-utils";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { useCallback, useState } from "react";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { Pages } from "@/src/types/pages";
import { getFileNameFromUrl } from "@/src/utils/url-utils";
import MetadataEditor from "@/src/components/utils/MetadataEditor";
import { MyMusicLibrary } from "@/src/music/library/music-library";
import FileList from "@/src/components/pages/upload/FileList";
import { FileContext } from "@/src/contexts/FileContext";
import { Music } from "@/src/types/music";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import VerticalSplit from "@/src/components/utils/VerticalSplit";

type FileUploadProps = {
  data: {
    uploadType: Pages.Upload.FileUploadType;
    url?: string;
    files?: File[];
  };
  onNavigate: Pages.NavigationMethod;
};

export default function FileUpload(props: FileUploadProps) {
  const [files, filesLoaded, setFiles] = useAsyncLoad<
    Music.Files.PreUploadFile[]
  >(
    async () => {
      let files: Music.Files.PreUploadFile[] = [];

      switch (props.data.uploadType) {
        case "file": {
          if (props.data.files === undefined) {
            throw new Error("Files missing from file upload");
          }

          files = await Promise.all(
            props.data.files.map(async (file) => {
              const fileName = file.name.replace(/\.[^/.]+$/, "");
              return await getPreUploadFileFromData(
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
            await getPreUploadFileFromData(
              await fetchFile(props.data.url),
              fileName
            ),
          ];
          break;
        }
      }

      const fileIds = files.map((f) => f.metadata.id);

      if (!fileIds.includes(openFileId) && files.length > 0) {
        setOpenFileId(files[0].metadata.id);
      }

      setSelectedFileIds((prev) => {
        const newSelected = prev.filter((f) => fileIds.includes(f));

        if (newSelected.length === 0) {
          newSelected.push(...fileIds);
        }

        return newSelected;
      });

      return files;
    },
    [],
    [props.data]
  );

  const [openFileId, setOpenFileId] = useState("");
  const openFile = files.find((f) => f.metadata.id === openFileId) ?? null;

  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const [fileStatuses, setFileStatuses] = useState<Pages.Upload.FileStatus[]>(
    []
  );
  const [isUploading, setIsUploading] = useState(false);

  const selectFile = useCallback(
    (fileId: string, isSelected: boolean) => {
      setSelectedFileIds((prev) => {
        prev = prev.filter((id) =>
          files.map((f) => f.metadata.id).includes(id)
        );

        if (isSelected) {
          if (!prev.includes(fileId)) {
            return [...prev, fileId];
          }
        } else {
          return prev.filter((f) => f !== fileId);
        }

        return prev;
      });
    },
    [files]
  );

  // Allows the user to select use shift to select all files between the current and last selected files

  const setFileMetadataProperty =
    useCallback<Pages.Upload.SetFileMetadataFunction>(
      (fileId, property, value) => {
        setFiles((prev) => {
          return prev.map((mapFiles) => {
            if (mapFiles.metadata.id !== fileId) {
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

  const uploadSelectedFiles = async () => {
    const selectedFiles = files.filter((f) =>
      selectedFileIds.includes(f.metadata.id)
    );
    setIsUploading(true);

    setFileStatuses(
      selectedFiles.map((f) => ({ id: f.metadata.id, status: "waiting" }))
    );

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setFileStatuses((prev) => {
        return prev.map((s) => {
          if (s.id === file.metadata.id) {
            return {
              id: file.metadata.id,
              status: "uploading",
            };
          } else {
            return s;
          }
        });
      });
      await MyMusicLibrary.uploadFile(file);
      setFileStatuses((prev) => {
        return prev.map((s) => {
          if (s.id === file.metadata.id) {
            return {
              id: file.metadata.id,
              status: "uploaded",
            };
          } else {
            return s;
          }
        });
      });
    }

    toast(`Completed preupload for ${selectedFiles.length} files`, {
      type: "success",
    });
    props.onNavigate("back");
  };

  const ableToUpload =
    files.filter((f) => selectedFileIds.includes(f.metadata.id)).length > 0;

  if (!filesLoaded) {
    return <FullCover />;
  }

  return (
    <FileContext.Provider value={openFile}>
      <VerticalSplit
        left={
          <div className="flex flex-col h-full">
            <FileList
              files={files}
              onOpenFile={setOpenFileId}
              selectedFiles={selectedFileIds}
              setSelectedFile={selectFile}
              ableToSelect={!isUploading}
              fileStatuses={fileStatuses}
            />
            <button
              onClick={() => {
                if (
                  confirm("Are you sure you want to upload the selected files?")
                ) {
                  uploadSelectedFiles();
                }
              }}
              disabled={!ableToUpload || isUploading}
              className="text-white m-4 rounded-lg btn success border-2"
            >
              {ableToUpload && !isUploading ? (
                selectedFileIds.length !== files.length ? (
                  "Upload selected files"
                ) : (
                  "Upload all files"
                )
              ) : !isUploading ? (
                "No files selected"
              ) : (
                <span className="flex flex-row justify-center gap-2">
                  {"Performing inital upload"}
                  <Loader2 className="animate-spin" />
                </span>
              )}
            </button>
          </div>
        }
        right={
          <div className="p-7 h-full overflow-auto relative">
            <MetadataEditor setFileMetadata={setFileMetadataProperty} />
          </div>
        }
        defaultPosition="left"
        minWidth={450}
      />
    </FileContext.Provider>
  );
}
