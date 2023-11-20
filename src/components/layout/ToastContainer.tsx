import { RealtimeStatus } from "@/src/api/ably-client";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MusicLibrary } from "@/src/music/library/music-library";
import { AblyMessage } from "fm-player-shared";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ToastProps } from "react-toastify/dist/types";

export default function ToastManager() {
  const handledFileIds = useRef<string[]>([]);

  useEffect(() => {
    const handleUploadStatus = (
      message: AblyMessage.FileUpload.UploadStatus
    ) => {
      if (handledFileIds.current.includes(message.fileId)) {
        return;
      }

      handledFileIds.current.push(message.fileId);
      toast(<UploadToast status={message.status} trackId={message.fileId} />, {
        toastId: message.fileId,
        autoClose: false,
        isLoading: true,
        type: "info",
      });
    };

    const unsubscribe = RealtimeStatus.uploadStatusChannel.subscribe(
      handleUploadStatus,
      "status"
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ToastContainer
      className="dark:invert overflow-hidden"
      position="bottom-right"
      draggable={true}
      draggableDirection="x"
      limit={5}
      theme="colored"
    />
  );
}

const FileStatus = AblyMessage.FileUpload.FileStatus;

type UploadToastProps = {
  closeToast?: () => void;
  toastProps?: ToastProps;
  trackId: string;
  status: AblyMessage.FileUpload.FileStatus;
};

// eslint-disable-next-line react/no-multi-comp
function UploadToast(props: UploadToastProps) {
  const [trackName] = useAsyncLoad(
    async () => {
      return (
        (await MusicLibrary.db.track.get({ id: props.trackId }))?.title ?? null
      );
    },
    null,
    [props.trackId]
  );
  const [status, setStatus] = useState(props.status);

  useEffect(() => {
    const unsubscribe = RealtimeStatus.uploadStatusChannel.subscribe(
      (message) => {
        if (message.fileId !== props.trackId) {
          return;
        }
        setStatus(message.status);

        switch (message.status) {
          case FileStatus.ConversionFailed:
          case FileStatus.DownloadFailed:
          case FileStatus.ConversionComplete:
          case FileStatus.DownloadComplete: {
            toast.update(props.trackId, {
              autoClose: 3000,
              isLoading: false,
              type: [
                FileStatus.ConversionFailed,
                FileStatus.DownloadFailed,
              ].includes(message.status)
                ? "error"
                : "success",
            });
            break;
          }
          case FileStatus.DownloadStarted:
          case FileStatus.ConversionStarted: {
            toast.update(props.trackId, {
              isLoading: true,
              autoClose: false,
              type: "info",
            });
          }
        }

        if (message.error) {
          console.error(
            Object.keys(AblyMessage.FileUpload.ErrorReason)[message.error]
          );
        }
      },
      "status"
    );

    return () => {
      unsubscribe();
    };
  }, [props.trackId]);

  const trackNameOrId = trackName ?? props.trackId;
  let message = "";

  switch (status) {
    case FileStatus.ConversionStarted: {
      message = `Converting '${trackNameOrId}'...`;
      break;
    }
    case FileStatus.ConversionFailed: {
      message = `An error has occurred while converting '${trackNameOrId}' please see console for details.`;
      break;
    }
    case FileStatus.ConversionComplete: {
      message = `Successfully converted '${trackNameOrId}'`;
      break;
    }
    case FileStatus.DownloadStarted: {
      message = `Downloading audio for '${trackNameOrId}'...`;
      break;
    }
    case FileStatus.DownloadFailed: {
      message = `An error has occurred while downloading '${trackNameOrId}' please see console for details.`;
      break;
    }
    case FileStatus.DownloadComplete: {
      message = `Successfully downloaded audio for '${trackNameOrId}'`;
      break;
    }
  }

  return <span>{message}</span>;
}
