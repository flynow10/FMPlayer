import { Realtime, Types } from "ably";

class AblyChannelWrapper {
  private readonly channel: Types.RealtimeChannelPromise;
  constructor(channel: Types.RealtimeChannelPromise) {
    this.channel = channel;
  }

  public subscribe(
    callback: (status: Types.Message) => void,
    event: string = "status"
  ): void {
    this.channel.subscribe(event, (msg: Types.Message) => {
      callback(msg);
    });
  }

  public unsubscribe(
    event: string = "all",
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

  public connect() {
    this.client.connect();
    this.client.connection.once("connected", () => {
      console.log("Ably connected");
    });
  }
}

export const LambdaStatus = new AblyClient();
