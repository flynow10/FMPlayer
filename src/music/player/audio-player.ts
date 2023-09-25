/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Playlist } from "@/src/music/playlists/playlist";
import { PlaylistHelper } from "@/src/music/utils/playlist-helper";
import { Music } from "@/src/types/music";
import { useEffect, useState } from "react";

type AudioPlayerEventType =
  | AudioTagEvents
  | "nexttrack"
  | "previoustrack"
  | "restartedtrack"
  | "setupNewTrack"
  | "createAudioContext"
  | "changeRepeatMode"
  | "loadNewTrack";
type AudioTagEvents =
  | "play"
  | "pause"
  | "timeupdate"
  | "canplaythrough"
  | "progress"
  | "ended";
type AudioPlayerEventListener = (audioPlayer: AudioPlayer) => void;

type AudioTagListenerPair<K extends keyof HTMLMediaElementEventMap> = {
  type: K;
  listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any;
};

class AudioTag extends Audio {
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

type KeyMap = {
  currentTime: number | null;
  duration: number | null;
  isPlaying: boolean | null;
  currentTrackId: string | null;
  hasPlayedOnce: boolean;
  repeatMode: Music.RepeatMode;
  percentLoaded: number;
  audioLoaded: boolean;
  loadingNewTrack: boolean;
};

type HookKeys = {
  [Key in keyof KeyMap as `use${Capitalize<Key>}`]: () => KeyMap[Key];
} & {
  [Key in keyof KeyMap]: KeyMap[Key];
};

const createHook = <Key extends keyof KeyMap>(
  audioPlayer: AudioPlayer,
  hookName: Key,
  events: AudioPlayerEventType | AudioPlayerEventType[]
): (() => KeyMap[Key]) => {
  const eventArray = typeof events === "string" ? [events] : events;
  return () => {
    const [state, setState] = useState(audioPlayer[hookName]);
    useEffect(() => {
      const listener = () => {
        setState(audioPlayer[hookName]);
      };
      eventArray.forEach((eventName) => {
        audioPlayer.addEventListener(eventName, listener);
      });
      return () => {
        eventArray.forEach((eventName) => {
          audioPlayer.removeEventListener(eventName, listener);
        });
      };
    });
    return state;
  };
};

export class AudioPlayer implements HookKeys {
  public readonly PREVIOUS_TRACK_RESTART_DELAY = 3;

  private eventListeners: {
    [Key in AudioPlayerEventType]: AudioPlayerEventListener[];
  } = {
    canplaythrough: [],
    nexttrack: [],
    pause: [],
    play: [],
    previoustrack: [],
    progress: [],
    restartedtrack: [],
    timeupdate: [],
    ended: [],
    setupNewTrack: [],
    createAudioContext: [],
    changeRepeatMode: [],
    loadNewTrack: [],
  };

  private currentTrackIndex = 0;
  private trackQueue: Playlist = new Playlist();
  private _repeatMode: Music.RepeatMode = "none";
  private wasPlayingBeforeSeek: boolean | null = null;
  private seeking = false;

  private currentAudioTag: AudioTag | null = null;
  private nextAudioTag: AudioTag | null = null;
  private isAudioLoaded = false;
  private _percentLoaded = 0;
  private isLoadingNewTrack = false;

  private audioContext: AudioContext | null = null;

  public get audioLoaded() {
    return this.isAudioLoaded;
  }

  public get percentLoaded() {
    return this._percentLoaded;
  }

  public get loadingNewTrack() {
    return this.isLoadingNewTrack;
  }

  public get repeatMode() {
    return this._repeatMode;
  }

  public get hasPlayedOnce() {
    return this.audioContext !== null;
  }

  public get isPlaying() {
    if (this.currentAudioTag === null) return false;
    return !this.currentAudioTag.paused;
  }

  public get currentTime() {
    if (this.currentAudioTag === null) return null;
    return this.currentAudioTag.currentTime;
  }

  public get duration() {
    if (this.currentAudioTag === null) return null;
    return this.currentAudioTag.duration;
  }

  public get currentTrackId() {
    if (this.currentAudioTag === null) return null;
    return this.currentAudioTag.trackId;
  }

  public constructor() {
    this.setupInternalListeners();
  }

  public useCurrentTime = createHook(this, "currentTime", [
    "timeupdate",
    "setupNewTrack",
  ]);
  public useDuration = createHook(this, "duration", [
    "timeupdate",
    "play",
    "pause",
    "setupNewTrack",
  ]);
  public useIsPlaying = createHook(this, "isPlaying", [
    "play",
    "pause",
    "setupNewTrack",
    "loadNewTrack",
  ]);
  public useCurrentTrackId = createHook(
    this,
    "currentTrackId",
    "setupNewTrack"
  );
  public useHasPlayedOnce = createHook(
    this,
    "hasPlayedOnce",
    "createAudioContext"
  );
  public useRepeatMode = createHook(this, "repeatMode", "changeRepeatMode");
  public useAudioLoaded = createHook(this, "audioLoaded", [
    "canplaythrough",
    "setupNewTrack",
  ]);
  public usePercentLoaded = createHook(this, "percentLoaded", [
    "progress",
    "canplaythrough",
    "setupNewTrack",
  ]);
  public useLoadingNewTrack = createHook(this, "loadingNewTrack", [
    "loadNewTrack",
    "setupNewTrack",
    "nexttrack",
    "previoustrack",
  ]);

  public setRepeatMode(mode: Music.RepeatMode) {
    this._repeatMode = mode;
    this.callEvent("changeRepeatMode");
  }

  private setupInternalListeners() {
    const mediaSession = window?.navigator?.mediaSession;
    if (mediaSession) {
      mediaSession.setActionHandler("play", () => {
        this.unpauseAudio();
      });
      mediaSession.setActionHandler("pause", () => {
        this.pauseAudio();
      });
      mediaSession.setActionHandler("nexttrack", () => {
        this.nextTrack();
      });
      mediaSession.setActionHandler("previoustrack", () => {
        this.previousTrack();
      });
      const seekCallback = (e: MediaSessionActionDetails) => {
        if (this.currentAudioTag !== null) {
          const skipTime = e.seekOffset || 10;
          this.seekToTime(
            this.currentAudioTag.currentTime +
              (e.action === "seekforward" ? 1 : -1) * skipTime,
            true
          );
        }
      };
      mediaSession.setActionHandler("seekforward", seekCallback);
      mediaSession.setActionHandler("seekbackward", seekCallback);
      mediaSession.setActionHandler("seekto", (e) => {
        if (e.seekTime) {
          this.seekToTime(e.seekTime, true);
        }
      });
      this.addEventListener("play", () => {
        mediaSession.playbackState = "playing";
      });
      this.addEventListener("pause", () => {
        mediaSession.playbackState = "paused";
      });
      this.addEventListener("timeupdate", () => {
        mediaSession.setPositionState({
          duration: this.currentAudioTag?.duration,
          playbackRate: this.currentAudioTag?.playbackRate,
          position: this.currentAudioTag?.currentTime,
        });
      });
    }
    this.addEventListener("ended", this.onAudioEnded.bind(this));
    this.addEventListener("canplaythrough", this.onAudioLoaded.bind(this));
    this.addEventListener("progress", this.onAudioLoadProgress.bind(this));
  }

  private onAudioEnded() {
    if (this.seeking) {
      return;
    }
    if (this.repeatMode === "one") {
      return this.setupTrack();
    } else {
      return this.nextTrack();
    }
  }

  private onAudioLoaded() {
    if (this.currentAudioTag !== null) {
      this._percentLoaded = this.getPercentLoaded(this.currentAudioTag);
    }
    this.isAudioLoaded = true;
  }

  private onAudioLoadProgress() {
    if (this.currentAudioTag !== null) {
      this._percentLoaded = this.getPercentLoaded(this.currentAudioTag);
    }
    if (this.percentLoaded === 1) {
      this.nextAudioTag?.startLoad();
    }
  }

  private async setupTrack(shouldPlay = true) {
    this.isLoadingNewTrack = false;
    const trackId = this.getTrackId();
    if (trackId === null) {
      throw new Error("Couldn't find next track to play!");
    }

    if (this.audioContext === null) {
      this.audioContext = new AudioContext();
      this.callEvent("createAudioContext");
    }

    if (
      this.currentAudioTag !== null &&
      this.currentAudioTag.trackId === trackId
    ) {
      this.currentAudioTag.currentTime = 0;
    } else {
      if (this.currentAudioTag !== null) {
        this.clearAudioTag(this.currentAudioTag);
      }
      if (this.nextAudioTag !== null && this.nextAudioTag.trackId === trackId) {
        this.currentAudioTag = this.nextAudioTag;
      } else {
        this.currentAudioTag = new AudioTag(trackId, this.audioContext);
      }

      this.connectEventListenersToAudioTag(this.currentAudioTag);
    }

    this.isAudioLoaded = this.currentAudioTag.readyState === 4;
    this._percentLoaded = this.getPercentLoaded(this.currentAudioTag);

    const nextTrackId = this.getNextId();
    if (nextTrackId !== null) {
      this.nextAudioTag = new AudioTag(nextTrackId, this.audioContext);
    } else {
      this.nextAudioTag = null;
    }

    this.currentAudioTag.mediaSourceNode.connect(this.audioContext.destination);

    if (shouldPlay) {
      await this.currentAudioTag.play();
    } else {
      await this.currentAudioTag.startLoad();
    }
    this.callEvent("setupNewTrack");
  }

  private connectEventListenersToAudioTag(audioTag: AudioTag) {
    const eventList: AudioTagEvents[] = [
      "canplaythrough",
      "pause",
      "play",
      "progress",
      "timeupdate",
      "ended",
    ];
    eventList.forEach((event) => {
      audioTag.addEventListener(event, () => {
        this.callEvent(event);
      });
    });
  }

  private clearAudioTag(tag: AudioTag) {
    tag.pause();
    tag.removeAllEventListeners();
    tag.mediaSourceNode.disconnect();
    tag.remove();
  }

  private getPercentLoaded(tag: AudioTag) {
    const buffered = tag.buffered;
    if (buffered.length) {
      const bufferPercent = buffered.end(0) / tag.duration;
      return bufferPercent;
    }
    return 0;
  }

  private getTrackId(): string | null {
    if (this.trackQueue.isBlank()) {
      return null;
    } else {
      return this.trackQueue.songList[this.currentTrackIndex].songId;
    }
  }

  private getNextId(): string | null {
    if (this.trackQueue.isBlank()) {
      return null;
    } else {
      if (this.currentTrackIndex + 1 === this.trackQueue.songList.length) {
        if (this.repeatMode === "none") {
          return null;
        }
      }
      return this.trackQueue.songList[
        (this.currentTrackIndex + 1) % this.trackQueue.songList.length
      ].songId;
    }
  }

  public toggleAudio() {
    if (this.currentAudioTag === null) {
      return null;
    }
    const isPaused = this.currentAudioTag.paused;
    if (isPaused) {
      return this.unpauseAudio();
    } else {
      return this.pauseAudio();
    }
  }

  public unpauseAudio(): boolean {
    if (this.currentAudioTag === null) {
      return false;
    }
    const isPaused = this.currentAudioTag.paused;
    if (isPaused) {
      this.currentAudioTag.play();
    }
    return isPaused;
  }

  public pauseAudio(): boolean {
    if (this.currentAudioTag === null) {
      return false;
    }
    const isPlaying = !this.currentAudioTag.paused;
    if (isPlaying) {
      this.currentAudioTag.pause();
    }
    return isPlaying;
  }

  public restartAudio() {
    if (this.currentAudioTag === null) {
      return false;
    }
    this.currentAudioTag.currentTime = 0;
    this.callEvent("restartedtrack");
    return true;
  }

  public async previousTrack(useRestartDelay = false) {
    if (
      this.repeatMode === "one" ||
      (useRestartDelay &&
        this.currentAudioTag &&
        this.currentAudioTag.currentTime > this.PREVIOUS_TRACK_RESTART_DELAY)
    ) {
      this.restartAudio();
      return;
    }
    this.isLoadingNewTrack = true;

    if (this.currentTrackIndex > 0) {
      this.currentTrackIndex--;
    } else if (this.repeatMode === "all") {
      this.currentTrackIndex = this.trackQueue.songList.length - 1;
    }
    this.callEvent("previoustrack");
    await this.setupTrack();
  }

  public async nextTrack() {
    this.isLoadingNewTrack = true;
    if (this.currentTrackIndex < this.trackQueue.songList.length - 1) {
      this.currentTrackIndex++;
      this.callEvent("nexttrack");
      await this.setupTrack();
    } else {
      this.currentTrackIndex = 0;
      this.callEvent("nexttrack");
      await this.setupTrack(this.repeatMode !== "none");
    }
  }

  public seekToTime(time: number, end = false) {
    this.seeking = true;
    if (this.currentAudioTag === null) {
      return false;
    }
    if (this.wasPlayingBeforeSeek === null) {
      this.wasPlayingBeforeSeek = !this.currentAudioTag.paused;
    }

    if (!this.currentAudioTag.paused && !end) {
      this.currentAudioTag.pause();
    }

    this.currentAudioTag.currentTime = time;

    if (end) {
      if (this.wasPlayingBeforeSeek) {
        if (this.currentAudioTag.currentTime >= this.currentAudioTag.duration) {
          this.nextTrack();
        } else {
          this.currentAudioTag.play();
        }
      }
      this.wasPlayingBeforeSeek = null;
      this.seeking = false;
    }
  }

  private beginLoadingNewTrack() {
    this.currentAudioTag?.pause();
    this.isLoadingNewTrack = true;
    this.callEvent("loadNewTrack");
  }

  public play = {
    track: (trackId: string) => {
      this.beginLoadingNewTrack();
      const playlist = new Playlist();
      playlist.addAction(new PlaySongAction(trackId));
      return this.playPlaylist(playlist);
    },
    trackList: async (
      trackList: string | Music.HelperDB.ThinTrackList,
      trackNumber = 0
    ) => {
      this.beginLoadingNewTrack();
      let loadedTrackList: Music.HelperDB.ThinTrackList;
      if (typeof trackList === "string") {
        const nullableTrackList = await MusicLibrary.db.trackList.get({
          id: trackList,
        });
        if (nullableTrackList === null) {
          return false;
        }
        loadedTrackList = nullableTrackList;
      } else {
        loadedTrackList = trackList;
      }
      const index = loadedTrackList.trackConnections
        .sort((a, b) => a.trackNumber - b.trackNumber)
        .findIndex((connection) => connection.trackNumber === trackNumber);
      const playlist = PlaylistHelper.getPlaylistFromTrackList(loadedTrackList);
      return this.playPlaylist(playlist, index === -1 ? 0 : index);
    },
    album: async (
      album: string | Music.DB.TableType<"Album">,
      trackNumber = 0
    ) => {
      this.beginLoadingNewTrack();
      let loadedAlbum: Music.DB.TableType<"Album">;
      if (typeof album === "string") {
        const nullableAlbum = await MusicLibrary.db.album.get({
          id: album,
        });
        if (nullableAlbum === null) {
          return false;
        }
        loadedAlbum = nullableAlbum;
      } else {
        loadedAlbum = album;
      }

      return this.play.trackList(loadedAlbum.trackList, trackNumber);
    },
  };

  private async playPlaylist(
    playlist: Playlist,
    startIndex = 0
  ): Promise<boolean> {
    if (playlist.songList.length <= startIndex) {
      return false;
    }
    this.trackQueue = playlist;
    this.currentTrackIndex = startIndex;
    await this.setupTrack();
    return true;
  }

  public addEventListener(
    event: AudioPlayerEventType,
    listener: AudioPlayerEventListener
  ) {
    this.eventListeners[event].push(listener);
  }

  public removeEventListener(
    event: AudioPlayerEventType,
    listener: AudioPlayerEventListener
  ) {
    this.eventListeners[event] = this.eventListeners[event].filter(
      (value) => value !== listener
    );
  }

  private callEvent(event: AudioPlayerEventType) {
    console.log("Event: " + event);
    this.eventListeners[event].forEach((listener) => {
      listener(this);
    });
  }
}