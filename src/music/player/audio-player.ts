import { useEffect, useState } from "react";

import { playableFunctionFromTracks } from "@/src/music/functions/core/function-helper";
import { PlayableFunction } from "@/src/music/functions/core/playable-function";
import { validateFunction } from "@/src/music/functions/validation/validate-function";
import { MusicLibrary } from "@/src/music/library/music-library";
import { AudioTag } from "@/src/music/player/audio-tag";
import { Functions } from "@/src/types/functions";
import { Music } from "@/src/types/music";

type AudioPlayerEventType =
  | AudioTagEvents
  | "nextTrack"
  | "previousTrack"
  | "restartedTrack"
  | "moveToTrack"
  | "setupNewTrack"
  | "createAudioContext"
  | "changeRepeatMode"
  | "loadNewTrack"
  | "playNewQueue"
  | "updateQueue";
type AudioTagEvents =
  | "play"
  | "pause"
  | "timeupdate"
  | "canplaythrough"
  | "progress"
  | "ended";
type AudioPlayerEventListener = (audioPlayer: AudioPlayer) => void;

type KeyMap = {
  currentTime: number | null;
  duration: number | null;
  isPlaying: boolean;
  currentTrackId: string | null;
  currentFunctionState: Functions.RuntimeState | null;
  hasPlayedOnce: boolean;
  repeatMode: Music.RepeatMode;
  percentLoaded: number;
  audioLoaded: boolean;
  loadingNewTrack: boolean;
  trackQueue: PlayableFunction;
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
    const [state, setState] = useState(() => audioPlayer[hookName]);
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
    }, [state]);
    return state;
  };
};
export class AudioPlayer implements HookKeys {
  public readonly PREVIOUS_TRACK_RESTART_DELAY = 3;

  private eventListeners: {
    [Key in AudioPlayerEventType]: AudioPlayerEventListener[];
  } = {
    canplaythrough: [],
    nextTrack: [],
    moveToTrack: [],
    pause: [],
    play: [],
    previousTrack: [],
    progress: [],
    restartedTrack: [],
    timeupdate: [],
    ended: [],
    setupNewTrack: [],
    createAudioContext: [],
    changeRepeatMode: [],
    loadNewTrack: [],
    playNewQueue: [],
    updateQueue: [],
  };

  private _trackQueue: PlayableFunction = new PlayableFunction([]);
  private _repeatMode: Music.RepeatMode = "none";
  private wasPlayingBeforeSeek: boolean | null = null;
  private seeking = false;

  private currentAudioTag: AudioTag | null = null;
  private _currentFunctionState: Functions.RuntimeState | null = null;
  private trackStateHistory: Functions.RuntimeState[] = [];
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

  public get trackQueue() {
    return this._trackQueue;
  }

  public get currentFunctionState() {
    return this._currentFunctionState;
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
    "nextTrack",
    "previousTrack",
    "moveToTrack",
  ]);

  public useTrackQueue = createHook(this, "trackQueue", [
    "playNewQueue",
    "updateQueue",
  ]);

  public useCurrentFunctionState = createHook(this, "currentFunctionState", [
    "loadNewTrack",
    "setupNewTrack",
    "nextTrack",
    "previousTrack",
    "moveToTrack",
    "playNewQueue",
    "updateQueue",
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
    if (this._trackQueue.isBlank()) {
      return null;
    } else {
      return this._currentFunctionState?.currentTrackId ?? null;
    }
  }

  /**
   * This only returns a possible id!
   *
   * Non-deterministic actions, may return different results when when actually running
   */
  private getNextId(): string | null {
    if (this._trackQueue.isBlank()) {
      return null;
    } else {
      if (this._currentFunctionState?.isEnd && this._repeatMode === "none") {
        return null;
      }
      const [nextState] = this._trackQueue.getNextTrack(
        this._currentFunctionState ?? undefined
      );
      return nextState.currentTrackId;
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
    this.callEvent("restartedTrack");
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
    let lastTrackState = this.trackStateHistory.pop();

    if (lastTrackState === undefined) {
      if (this._repeatMode === "all") {
        const { lastState, trackStates } = this._trackQueue.getLastTrack();
        lastTrackState = lastState;
        this.trackStateHistory = trackStates;
      }
    } else {
      // For update of react state
      this.trackStateHistory = [...this.trackStateHistory];
    }

    if (lastTrackState) {
      this._currentFunctionState = lastTrackState;
    }

    this.callEvent("previousTrack");
    await this.setupTrack();
  }

  public async nextTrack() {
    this.isLoadingNewTrack = true;
    if (this._currentFunctionState) {
      // Don't use push because it doesn't trigger a react state update
      this.trackStateHistory = [
        ...this.trackStateHistory,
        this._currentFunctionState,
      ];
    }
    const [nextState, didEnd] = this._trackQueue.getNextTrack(
      this._currentFunctionState ?? undefined
    );
    this._currentFunctionState = nextState;
    this.callEvent("nextTrack");
    await this.setupTrack(!didEnd || this.repeatMode !== "none");
  }

  public async moveToTrack() {
    throw new Error("This has not been implemented yet!");
    // if (trackIndex >= 0 && trackIndex < this._trackQueue.trackList.length) {
    //   this.isLoadingNewTrack = true;
    //   this._currentTrackIndex = trackIndex;
    //   this.callEvent("moveToTrack");
    //   await this.setupTrack();
    // } else {
    //   throw new Error("This track index could not be played!");
    // }
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
    track: async (trackId: string) => {
      this.beginLoadingNewTrack();
      return this.playFunction(playableFunctionFromTracks(trackId));
    },
    trackList: async (
      trackList: string | Music.HelperDB.ThinTrackList,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // const index = loadedTrackList.trackConnections
      //   .sort((a, b) => a.trackNumber - b.trackNumber)
      //   .findIndex((connection) => connection.trackNumber === trackNumber);
      return this.playFunction(
        playableFunctionFromTracks(
          ...loadedTrackList.trackConnections.map(({ trackId }) => trackId)
        )
      );
    },
    album: async (
      album: string | Music.DB.TableType<"Album">,
      trackNumber = 0
    ) => {
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
    func: async (func: string | Music.DB.TableType<"Function">) => {
      let loadedFunction: Music.DB.TableType<"Function">;
      if (typeof func === "string") {
        const nullableFunction = await MusicLibrary.db.function.get({
          id: func,
        });
        if (nullableFunction === null) {
          return false;
        }
        loadedFunction = nullableFunction;
      } else {
        loadedFunction = func;
      }
      if (!validateFunction(loadedFunction.functionData)) {
        throw new Error("Invalid function data! Cannot play");
      }
      return this.playFunction(
        new PlayableFunction(loadedFunction.functionData)
      );
    },
  };

  public queue = {
    addFunction: async (
      data:
        | string
        | Music.DB.TableType<"Function">
        | Functions.FunctionTree
        | PlayableFunction,
      addNext = false
    ) => {
      let functionTree: Functions.FunctionTree;
      if (data instanceof PlayableFunction) {
        functionTree = data.functionTree;
      } else if (Array.isArray(data)) {
        if (!validateFunction(data)) {
          return false;
        }
        functionTree = data;
      } else if (typeof data === "string" || typeof data === "object") {
        if (typeof data === "string") {
          const result = await MusicLibrary.db.function.get({ id: data });
          if (!result) {
            return false;
          }
          data = result;
        }
        if (!validateFunction(data.functionData)) {
          return false;
        }
        functionTree = data.functionData;
      } else {
        return false;
      }

      this.queueFunction(new PlayableFunction(functionTree), addNext);
      return true;
    },
    addTrack: async (
      trackId: string | Music.DB.TableType<"Track">,
      addNext = false
    ) => {
      if (typeof trackId !== "string") {
        trackId = trackId.id;
      }
      this.queueFunction(playableFunctionFromTracks(trackId), addNext);
      return true;
    },
    /**
     * Adds Playlist to the queue by value not reference
     **/
    addTrackList: async (
      trackList: string | Music.HelperDB.ThinTrackList,
      addNext = false
    ) => {
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

      const trackIds: string[] = loadedTrackList.trackConnections.map(
        (trackConn) => {
          return trackConn.trackId;
        }
      );
      this.queueFunction(playableFunctionFromTracks(...trackIds), addNext);
      return true;
    },
  };

  private async queueFunction(
    newFunction: PlayableFunction,
    addNext = false
  ): Promise<void> {
    const wasBlank = this._trackQueue.isBlank();
    if (wasBlank) {
      this.beginLoadingNewTrack();
    }
    if (!addNext || !this._currentFunctionState) {
      this._trackQueue = this._trackQueue.addStatements(
        newFunction.functionTree
      );
    } else {
      this._trackQueue = this._trackQueue.insertAfter(
        this._currentFunctionState.currentActionId,
        newFunction.functionTree
      );
    }
    this.callEvent("updateQueue");
    if (wasBlank) {
      this.playFunction(this._trackQueue);
    }
  }

  private async playFunction(newFunction: PlayableFunction): Promise<void> {
    this._trackQueue = newFunction;
    this._currentFunctionState = this._trackQueue.getNextTrack()[0];
    this.callEvent("playNewQueue");
    await this.setupTrack();
    return;
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
    console.log(event);
    this.eventListeners[event].forEach((listener) => {
      listener(this);
    });
  }
}
