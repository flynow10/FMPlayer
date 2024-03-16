import { useEffect, useRef } from "react";

import UploadToast from "@/src/components/layout/toasts/UploadToast";

import { RealtimeStatus } from "@/src/api/ably-client";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { AudioPlayer } from "@/src/music/player/audio-player";

import { AblyMessage } from "fm-player-shared";
import { toast, ToastContainer } from "react-toastify";

export default function ToastManager() {
  const handledFileIds = useRef<string[]>([]);
  const player = useAudioPlayer();

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
        data: message.fileId,
        type: "info",
      });
    };

    const ablyUnsubscribe = RealtimeStatus.uploadStatusChannel.subscribe(
      handleUploadStatus,
      "status"
    );

    const toastUnsubscribe = toast.onChange((toast) => {
      if (handledFileIds.current.includes(toast.data as string)) {
        handledFileIds.current.splice(
          handledFileIds.current.indexOf(toast.data as string),
          1
        );
      }
    });

    const queueListener = (_: AudioPlayer, actionsAdded?: string | number) => {
      if (typeof actionsAdded !== "number") {
        return;
      }

      toast(`Added ${actionsAdded} actions to the queue!`, {
        type: "success",
      });
    };

    player.addEventListener("updateQueue", queueListener);

    return () => {
      ablyUnsubscribe();
      toastUnsubscribe();
      player.removeEventListener("updateQueue", queueListener);
    };
  }, [player]);

  return (
    <ToastContainer
      className="dark:invert"
      position="top-right"
      closeOnClick
      draggableDirection="x"
      limit={10}
      stacked
      theme="colored"
    />
  );
}
