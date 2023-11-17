/* eslint-disable @typescript-eslint/no-explicit-any */
import { MusicLibrary } from "@/src/music/library/music-library";

type AudioTagListenerPair<K extends keyof HTMLMediaElementEventMap> = {
  type: K;
  listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any;
};

export class AudioTag extends Audio {
  public trackId: string;
  public listeners: AudioTagListenerPair<keyof HTMLMediaElementEventMap>[] = [];
  public mediaSourceNode: MediaElementAudioSourceNode;

  public constructor(trackId: string, audioContext: AudioContext) {
    super();
    this.mediaSourceNode = new MediaElementAudioSourceNode(audioContext, {
      mediaElement: this,
    });
    this.trackId = trackId;
    this.crossOrigin = "*";
  }

  public async play(): Promise<void> {
    await this.setFileSrc();
    await super.play();
  }

  public async startLoad(): Promise<void> {
    await this.setFileSrc();
    this.load();
  }

  private async setFileSrc() {
    if (this.src === "") {
      const trackUrl = await MusicLibrary.audio.getAudioFileUrl(this.trackId);
      if (trackUrl === null) {
        throw new Error("Failed to retrieve track url from aws!");
      }
      if (this.src !== trackUrl) {
        this.src = trackUrl;
      }
    }
  }

  public addEventListener<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.addEventListener(type, listener, options);
    this.listeners.push({
      type,
      listener: listener as (
        this: HTMLAudioElement,
        ev: HTMLMediaElementEventMap[keyof HTMLMediaElementEventMap]
      ) => any,
    });
  }

  public removeAllEventListeners() {
    this.listeners.forEach((pair) => {
      this.removeEventListener(pair.type, pair.listener);
    });
    this.listeners = [];
  }
}
