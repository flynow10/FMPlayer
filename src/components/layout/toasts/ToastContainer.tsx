import { useEffect, useRef } from "react";

import UploadToast from "@/src/components/layout/toasts/UploadToast";

import { RealtimeStatus } from "@/src/api/ably-client";

import { AblyMessage } from "fm-player-shared";
import { toast, ToastContainer } from "react-toastify";

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

    return () => {
      ablyUnsubscribe();
      toastUnsubscribe();
    };
  }, []);

  return (
    <ToastContainer
      className="dark:invert"
      position="bottom-right"
      closeOnClick
      draggableDirection="x"
      limit={10}
      stacked
      theme="colored"
    />
  );
}
