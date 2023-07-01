import { API } from "@/src/types/api";
import { Realtime, Types } from "ably";
import { Id, ToastOptions, toast } from "react-toastify";

class AblyChannelWrapper {
  private readonly channel: Types.RealtimeChannelPromise;
  constructor(channel: Types.RealtimeChannelPromise) {
    this.channel = channel;
  }

  public subscribe(
    callback: (status: Types.Message) => void,
    event = "status"
  ): void {
    this.channel.subscribe(event, (msg: Types.Message) => {
      callback(msg);
    });
  }

  public unsubscribe(
    event = "all",
    callback?: (status: Types.Message) => void
  ): void {
    if (event === "all") {
      this.channel.unsubscribe();
      this.channel.detach();
    } else {
      if (callback) {
        this.channel.unsubscribe(event, callback);
      } else {
        this.channel.unsubscribe(event);
      }
    }
  }

  public async publish(message: string): Promise<void> {
    await this.channel.publish("status", message);
  }
}

export class AblyClient {
  private readonly client: Types.RealtimePromise;
  private readonly uploadStatusChannel: AblyChannelWrapper;
  private static readonly CONNETION_TIMEOUT = 10000;
  private toastIds: { [key: string]: Id } = {};

  constructor() {
    this.client = new Realtime.Promise({
      authUrl: "/api/ably-auth",
      autoConnect: false,
    });

    this.uploadStatusChannel = new AblyChannelWrapper(
      this.client.channels.get("upload-status")
    );

    this.tempInitChannels();
  }

  private tempInitChannels() {
    this.uploadStatusChannel.subscribe((message) => {
      if (message.name === "status") {
        const {
          file_name: name,
          status,
        }: { file_name: string; status: string } = message.data;
        let toastMessage = "",
          toastOptions: ToastOptions = {};

        switch (status) {
          case "started conversion": {
            toastMessage = `AWS Conversion has started for ${name}`;
            toastOptions = { type: "info", autoClose: false };
            break;
          }

          case "conversion complete": {
            toastMessage = `AWS Conversion completed successfully for ${name}`;
            toastOptions = {
              type: "success",
              autoClose: 5000,
              isLoading: false,
            };
            break;
          }
        }

        if (this.toastIds[name] && toast.isActive(this.toastIds[name])) {
          toast.update(this.toastIds[name], {
            render: toastMessage,
            ...toastOptions,
          });
        } else {
          this.toastIds[name] = toast.loading(toastMessage, toastOptions);
        }
      }
    });
  }

  public onUploadStatus(callback: (status: Types.Message) => void): void {
    this.uploadStatusChannel.subscribe(callback);
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
