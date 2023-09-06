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

type StateChangeListener = (stateChange: Types.ConnectionStateChange) => void;
class ConnectionStateManager {
  public _state: Types.ConnectionState = "initialized";
  public _stateChangeListeners: {
    state: Types.ConnectionState | "all";
    listener: StateChangeListener;
  }[] = [];

  public _onNewState(stateChange: Types.ConnectionStateChange) {
    this._state = stateChange.current;
    this._stateChangeListeners.forEach((value) => {
      if (value.state === stateChange.current || value.state === "all") {
        value.listener(stateChange);
      }
    });
  }

  public subscribe(callback: StateChangeListener): void;
  public subscribe(
    event: Types.ConnectionState,
    callback: StateChangeListener
  ): void;
  public subscribe(
    event: Types.ConnectionState | StateChangeListener,
    callback?: StateChangeListener
  ) {
    let innerEvent: Types.ConnectionState | "all";
    if (typeof event === "function") {
      callback = event;
      innerEvent = "all";
    } else {
      innerEvent = event;
    }
    if (callback === undefined) {
      throw new Error("Missing event callback!");
    }

    this._stateChangeListeners.push({
      state: innerEvent,
      listener: callback,
    });
  }

  public unsubscribe(): void;
  public unsubscribe(event: Types.ConnectionState): void;
  public unsubscribe(callback: StateChangeListener): void;
  public unsubscribe(
    event: Types.ConnectionState,
    callback: StateChangeListener
  ): void;
  public unsubscribe(
    event?: Types.ConnectionState | StateChangeListener,
    callback?: StateChangeListener
  ) {
    let innerEvent: Types.ConnectionState | "all" = "all";
    let innerCallback: StateChangeListener | undefined = undefined;
    if (callback !== undefined) {
      innerCallback = callback;
    } else if (event !== undefined) {
      if (typeof event === "function") {
        innerCallback = event;
      } else {
        innerEvent = event;
      }
    }

    this._stateChangeListeners = this._stateChangeListeners.filter((value) => {
      if (innerCallback !== undefined) {
        if (value.listener !== innerCallback) {
          return true;
        }
      }
      if (innerEvent !== "all") {
        if (value.state !== innerEvent) {
          return true;
        }
      }
      return false;
    });
  }
}

export class AblyClient {
  private static readonly CONNETION_TIMEOUT = 10000;
  private readonly client: Types.RealtimePromise;
  public stateManager: ConnectionStateManager = new ConnectionStateManager();
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
    this.initializeConnectionListener();
  }

  private async initializeConnectionListener() {
    this.client.connection.on((stateChange) => {
      if (
        stateChange.current === "disconnected" &&
        stateChange.reason &&
        stateChange.reason.cause
      ) {
        const cause = stateChange.reason.cause;
        if (typeof cause === "object" && "statusCode" in cause) {
          if (cause.statusCode === 501) {
            this.disconnect();
          }
        }
      }
      this.stateManager._onNewState(stateChange);
    });
  }

  public async disconnect() {
    try {
      this.client.close();
    } catch (_) {
      return;
    }
  }

  public async connect(): Promise<Types.ConnectionState> {
    this.client.connect();
    return new Promise((resolve) => {
      const stateListener = (stateChange: Types.ConnectionStateChange) => {
        if (
          (
            [
              "connected",
              "disconnected",
              "failed",
              "closed",
              "suspended",
            ] as Types.ConnectionState[]
          ).includes(stateChange.current)
        ) {
          this.client.connection.off(stateListener);
          resolve(stateChange.current);
        }
      };
      setTimeout(() => {
        this.client.connection.off(stateListener);
        resolve("suspended");
      }, AblyClient.CONNETION_TIMEOUT);
      this.client.connection.on(stateListener);
    });
  }
}

export const RealtimeStatus = new AblyClient();
