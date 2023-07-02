import { API } from "@/src/types/api";
import { Realtime, Types } from "ably";
import {
  Id,
  ToastContent,
  ToastOptions,
  UpdateOptions,
  toast,
} from "react-toastify";
import { AblyMessage } from "@fm-player/shared";
import { MyMusicLibrary } from "@/src/music/library/music-library";
import { createElement, useState } from "react";

type MessageCallback<T> = (msg: T) => void;
class AblyChannelWrapper<T> {
  private readonly channel: Types.RealtimeChannelPromise;
  constructor(channel: Types.RealtimeChannelPromise) {
    this.channel = channel;
  }

  public subscribe(callback: MessageCallback<T>, event = "status") {
    const callbackWrapper = (msg: Types.Message) => {
      callback(msg.data as T);
    };

    this.channel.subscribe(event, callbackWrapper);

    return () => {
      this.channel.unsubscribe(event, callbackWrapper);
    };
  }

  public unsubscribe(event = "all"): void {
    if (event === "all") {
      this.channel.unsubscribe();
      this.channel.detach();
    } else {
      this.channel.unsubscribe(event);
    }
  }

  public async publish(message: T, event = "status"): Promise<void> {
    await this.channel.publish(event, message);
  }
}

export class AblyClient {
  private readonly client: Types.RealtimePromise;
  private readonly uploadStatusChannel: AblyChannelWrapper<AblyMessage.UploadStatus>;
  private static readonly CONNETION_TIMEOUT = 10000;
  private toastIds: Record<string, Id> = {};
  private songTitles: Record<string, string> = {};

  constructor() {
    this.client = new Realtime.Promise({
      authUrl: "/api/ably-auth",
      autoConnect: false,
    });

    this.uploadStatusChannel = new AblyChannelWrapper(
      this.client.channels.get(AblyMessage.Channel.FileUpload)
    );

    this.initializeUploadStatus();
  }

  private async initializeUploadStatus() {
    this.uploadStatusChannel.subscribe((msg) => {
      console.log(msg);
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const client = this;
      function ToastBody(props: {
        text: (title: string) => string;
        fileId: string;
      }) {
        const [title, setTitle] = useState(props.fileId);
        client.getSongTitle(props.fileId).then(setTitle);

        return props.text(title);
      }

      switch (msg.status) {
        case AblyMessage.FileStatus.DownloadStarted: {
          this.createToast(
            msg.fileId,
            createElement(ToastBody, {
              text: (title) => `Downloading youtube audio for: ${title}`,
              fileId: msg.fileId,
            }),
            {
              isLoading: true,
              autoClose: false,
              type: "info",
            }
          );
          break;
        }

        case AblyMessage.FileStatus.DownloadComplete: {
          this.updateToast(msg.fileId, {
            isLoading: false,
            autoClose: 5000,
            type: "success",
            render: createElement(ToastBody, {
              text: (title) => `Download completed successfully for: ${title}`,
              fileId: msg.fileId,
            }),
          });
          break;
        }

        case AblyMessage.FileStatus.DownloadFailed: {
          this.updateToast(msg.fileId, {
            isLoading: false,
            autoClose: 5000,
            type: "error",
            render: createElement(ToastBody, {
              text: (title) => `Failed to download youtube audio for: ${title}`,
              fileId: msg.fileId,
            }),
          });
          break;
        }

        case AblyMessage.FileStatus.ConversionStarted: {
          this.createToast(
            msg.fileId,
            createElement(ToastBody, {
              text: (title) => `Converting audio file for: ${title}`,
              fileId: msg.fileId,
            }),
            {
              isLoading: true,
              autoClose: false,
              type: "info",
            }
          );
          break;
        }

        case AblyMessage.FileStatus.ConversionComplete: {
          this.updateToast(msg.fileId, {
            isLoading: false,
            autoClose: 5000,
            type: "success",
            render: createElement(ToastBody, {
              text: (title) =>
                `Conversion completed successfully for: ${title}`,
              fileId: msg.fileId,
            }),
          });
          break;
        }

        case AblyMessage.FileStatus.ConversionFailed: {
          this.updateToast(msg.fileId, {
            isLoading: false,
            autoClose: 5000,
            type: "error",
            render: createElement(ToastBody, {
              text: (title) => `Failed to convert audio for file:\n${title}`,
              fileId: msg.fileId,
            }),
          });
          break;
        }
      }
    });
  }

  private async getSongTitle(id: string) {
    if (this.songTitles[id]) {
      return this.songTitles[id];
    } else {
      return MyMusicLibrary.getSong(id).then((song) => {
        if (song !== undefined) {
          this.songTitles[id] = song.title;
        }
        return this.songTitles[id];
      });
    }
  }

  private createToast(
    fileId: string,
    content: ToastContent,
    options?: ToastOptions
  ) {
    const toastId = toast(content, options);
    this.toastIds[fileId] = toastId;
  }

  private updateToast(
    fileId: string,
    options: UpdateOptions,
    shouldCreateNew = true
  ) {
    const toastId = this.toastIds[fileId];
    if (toastId && toast.isActive(toastId)) {
      toast.update(toastId, options);
    } else if (shouldCreateNew) {
      this.createToast(fileId, options.render, options as ToastOptions);
    }
  }

  public async connect(): Promise<API.Ably.ConnectionStatus> {
    this.client.connect();
    return new Promise((resolve) => {
      let status: API.Ably.ConnectionStatus = "pending";
      this.client.connection.once("connected", () => {
        if (status === "pending") {
          status = "connected";
          console.log("Ably connected");
          resolve(status);
        }
      });
      setTimeout(() => {
        if (status === "pending") {
          status = "timeout";
          this.client.close();
          resolve(status);
        }
      }, AblyClient.CONNETION_TIMEOUT);
    });
  }
}

export const LambdaStatus = new AblyClient();
