import { API } from "@/src/types/api";
import { Realtime, Types } from "ably";

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
      console.log("Received upload status message", message);
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
