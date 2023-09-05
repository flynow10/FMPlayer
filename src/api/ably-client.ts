import { API } from "@/src/types/api";
import { Realtime, Types } from "ably";
import { AblyMessage } from "fm-player-shared";

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
  private static readonly CONNETION_TIMEOUT = 10000;
  private readonly client: Types.RealtimePromise;
  public readonly uploadStatusChannel: AblyChannelWrapper<AblyMessage.FileUpload.UploadStatus>;
  public readonly databaseUpdatesChannel: AblyChannelWrapper<AblyMessage.DatabaseChanges.UpdateMessage>;

  constructor() {
    this.client = new Realtime.Promise({
      authUrl: "/api/ably-auth",
      autoConnect: false,
    });

    this.uploadStatusChannel = new AblyChannelWrapper(
      this.client.channels.get(AblyMessage.Channel.FileUpload)
    );

    this.databaseUpdatesChannel = new AblyChannelWrapper(
      this.client.channels.get(AblyMessage.Channel.DatabaseChanges)
    );
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

export const RealtimeStatus = new AblyClient();
