import { useEffect, useState } from "react";

import { playableFunctionFromTracks } from "@/src/music/functions/core/function-helper";
import { PlayableFunction } from "@/src/music/functions/core/playable-function";
import { countActions } from "@/src/music/functions/utils/get-count";
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
  | "preSetupNewTrack"
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

type AudioEventData = string | number;

type AudioPlayerEventListener = (
  audioPlayer: AudioPlayer,
  data?: AudioEventData
) => void;

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
  trackStateHistory: Functions.RuntimeState[];
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

  private _eventListeners: {
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
    preSetupNewTrack: [],
    createAudioContext: [],
    changeRepeatMode: [],
    loadNewTrack: [],
    playNewQueue: [],
    updateQueue: [],
  };

  private _trackQueue: PlayableFunction = new PlayableFunction([]);
  private _repeatMode: Music.RepeatMode = "none";
  private _wasPlayingBeforeSeek: boolean | null = null;
  private _seeking = false;

  private _currentAudioTag: AudioTag | null = null;
  private _currentFunctionState: Functions.RuntimeState | null = null;
  private _trackStateHistory: Functions.RuntimeState[] = [];
  private _nextAudioTag: AudioTag | null = null;
  private _isAudioLoaded = false;
  private _percentLoaded = 0;
  private _isLoadingNewTrack = false;

  private _audioContext: AudioContext | null = null;

  public get audioLoaded() {
    return this._isAudioLoaded;
  }

  public get percentLoaded() {
    return this._percentLoaded;
  }

  public get loadingNewTrack() {
    return this._isLoadingNewTrack;
  }

  public get repeatMode() {
    return this._repeatMode;
  }

  public get hasPlayedOnce() {
    return this._audioContext !== null;
  }

  public get isPlaying() {
    if (this._currentAudioTag === null) return false;
    return !this._currentAudioTag.paused;
  }

  public get currentTime() {
    if (this._currentAudioTag === null) return null;
    return this._currentAudioTag.currentTime;
  }

  public get duration() {
    if (this._currentAudioTag === null) return null;
    return this._currentAudioTag.duration;
  }

  public get currentTrackId() {
    if (this._currentAudioTag === null) return null;
    return this._currentAudioTag.trackId;
  }

  public get trackQueue() {
    return this._trackQueue;
  }

  public get currentFunctionState() {
    return this._currentFunctionState;
  }

  public get trackStateHistory() {
    return this._trackStateHistory;
  }

  public constructor() {
    this.setupMediaSessionHooks();
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

  public useTrackStateHistory = createHook(this, "trackStateHistory", [
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

  private setupMediaSessionHooks() {
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
        if (this._currentAudioTag !== null) {
          const skipTime = e.seekOffset || 10;
          this.seekToTime(
            this._currentAudioTag.currentTime +
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
      this.addEventListener("preSetupNewTrack", () => {
        mediaSession.playbackState = "none";
      });
      this.addEventListener("timeupdate", () => {
        mediaSession.setPositionState({
          duration: this._currentAudioTag?.duration,
          playbackRate: this._currentAudioTag?.playbackRate,
          position: this._currentAudioTag?.currentTime,
        });
      });
    }
  }

  private setupInternalListeners() {
    this.addEventListener("ended", this.onAudioEnded.bind(this));
    this.addEventListener("canplaythrough", this.onAudioLoaded.bind(this));
    this.addEventListener("progress", this.onAudioLoadProgress.bind(this));
  }

  private onAudioEnded() {
    if (this._seeking) {
      return;
    }
    if (this.repeatMode === "one") {
      return this.setupTrack();
    } else {
      return this.nextTrack();
    }
  }

  private onAudioLoaded() {
    if (this._currentAudioTag !== null) {
      this._percentLoaded = this.getPercentLoaded(this._currentAudioTag);
    }
    this._isAudioLoaded = true;
  }

  private onAudioLoadProgress() {
    if (this._currentAudioTag !== null) {
      this._percentLoaded = this.getPercentLoaded(this._currentAudioTag);
    }
    if (this.percentLoaded === 1) {
      this._nextAudioTag?.startLoad();
    }
  }

  private async setupTrack(shouldPlay = true) {
    this._isLoadingNewTrack = false;
    const trackId = this.getTrackId();
    if (trackId === null) {
      throw new Error("Couldn't find next track to play!");
    }

    this.callEvent("preSetupNewTrack");

    if (this._audioContext === null) {
      this._audioContext = new AudioContext();
      this.callEvent("createAudioContext");
    }

    if (
      this._currentAudioTag !== null &&
      this._currentAudioTag.trackId === trackId
    ) {
      this._currentAudioTag.currentTime = 0;
    } else {
      if (this._currentAudioTag !== null) {
        this.clearAudioTag(this._currentAudioTag);
      }
      if (
        this._nextAudioTag !== null &&
        this._nextAudioTag.trackId === trackId
      ) {
        this._currentAudioTag = this._nextAudioTag;
        this._currentAudioTag.isNext = false;
      } else {
        const newTag = new AudioTag(trackId, this._audioContext);
        this._currentAudioTag = newTag;
      }

      this.connectEventListenersToAudioTag(this._currentAudioTag);
    }

    this._isAudioLoaded = this._currentAudioTag.readyState === 4;
    this._percentLoaded = this.getPercentLoaded(this._currentAudioTag);

    const nextTrackId = this.getNextId();
    if (nextTrackId !== null) {
      const newTag = new AudioTag(nextTrackId, this._audioContext);
      newTag.isNext = true;
      this._nextAudioTag = newTag;
    } else {
      this._nextAudioTag = null;
    }

    this._currentAudioTag.mediaSourceNode.connect(
      this._audioContext.destination
    );

    if (shouldPlay) {
      await this._currentAudioTag.play();
    } else {
      await this._currentAudioTag.startLoad();
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
    tag.kill();
    tag.mediaSourceNode.disconnect();
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
    if (this._currentAudioTag === null) {
      return null;
    }
    const isPaused = this._currentAudioTag.paused;
    if (isPaused) {
      return this.unpauseAudio();
    } else {
      return this.pauseAudio();
    }
  }

  /**
   * @returns Whether tag.play() was called or not
   */
  public unpauseAudio(): boolean {
    if (this._currentAudioTag === null) {
      return false;
    }

    const isPaused = this._currentAudioTag.paused;
    if (isPaused) {
      this._currentAudioTag.play();
    }

    return isPaused;
  }

  /**
   * @returns Whether tag.pause() was called or not
   */
  public pauseAudio(): boolean {
    if (this._currentAudioTag === null) {
      return false;
    }

    const isPlaying = !this._currentAudioTag.paused;
    if (isPlaying) {
      this._currentAudioTag.pause();
    }
    return isPlaying;
  }

  public restartAudio() {
    if (this._currentAudioTag === null) {
      return false;
    }
    this._currentAudioTag.currentTime = 0;
    this.callEvent("restartedTrack");
    return true;
  }

  public async previousTrack(useRestartDelay = false) {
    if (
      this.repeatMode === "one" ||
      (useRestartDelay &&
        this._currentAudioTag &&
        this._currentAudioTag.currentTime > this.PREVIOUS_TRACK_RESTART_DELAY)
    ) {
      this.restartAudio();
      return;
    }
    this._isLoadingNewTrack = true;
    let lastTrackState = this._trackStateHistory.pop();

    if (lastTrackState === undefined) {
      if (this._repeatMode === "all") {
        const { lastState, trackStates } = this._trackQueue.getLastTrack();
        lastTrackState = lastState;
        this._trackStateHistory = trackStates;
      }
    } else {
      // For update of react state
      this._trackStateHistory = [...this._trackStateHistory];
    }

    if (lastTrackState) {
      this._currentFunctionState = lastTrackState;
    }

    this.callEvent("previousTrack");
    await this.setupTrack();
  }

  public async nextTrack() {
    this._isLoadingNewTrack = true;
    if (this._currentFunctionState) {
      // Don't use push because it doesn't trigger a react state update
      this._trackStateHistory = [
        ...this._trackStateHistory,
        this._currentFunctionState,
      ];
    }
    const [nextState, didEnd] = this._trackQueue.getNextTrack(
      this._currentFunctionState ?? undefined
    );
    if (didEnd) {
      this._trackStateHistory = [];
    }
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
    this._seeking = true;
    if (this._currentAudioTag === null) {
      return false;
    }
    if (this._wasPlayingBeforeSeek === null) {
      this._wasPlayingBeforeSeek = !this._currentAudioTag.paused;
    }

    if (!this._currentAudioTag.paused && !end) {
      this._currentAudioTag.pause();
    }

    this._currentAudioTag.currentTime = time;

    if (end) {
      if (this._wasPlayingBeforeSeek) {
        if (
          this._currentAudioTag.currentTime >= this._currentAudioTag.duration
        ) {
          this.nextTrack();
        } else {
          this._currentAudioTag.play();
        }
      }
      this._wasPlayingBeforeSeek = null;
      this._seeking = false;
    }
  }

  private beginLoadingNewTrack() {
    this._currentAudioTag?.pause();
    this._isLoadingNewTrack = true;
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

      await this.queueFunction(new PlayableFunction(functionTree), addNext);
      return true;
    },
    addTrack: async (
      trackId: string | Music.DB.TableType<"Track">,
      addNext = false
    ) => {
      if (typeof trackId !== "string") {
        trackId = trackId.id;
      }
      await this.queueFunction(playableFunctionFromTracks(trackId), addNext);
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
      await this.queueFunction(
        playableFunctionFromTracks(...trackIds),
        addNext
      );
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
      await this.playFunction(newFunction);
      return;
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
    // Rewrite this function state
    this._currentFunctionState = this._trackQueue.getNextTrack(
      this._trackStateHistory[this._trackStateHistory.length - 1]
    )[0];
    this.callEvent("updateQueue", countActions(newFunction.functionTree));
  }

  private async playFunction(newFunction: PlayableFunction): Promise<void> {
    this._trackQueue = newFunction;
    this._trackStateHistory = [];
    this._currentFunctionState = this._trackQueue.getNextTrack()[0];
    this.callEvent("playNewQueue");
    await this.setupTrack();
    return;
  }

  public addEventListener(
    event: AudioPlayerEventType,
    listener: AudioPlayerEventListener
  ) {
    this._eventListeners[event].push(listener);
  }

  public removeEventListener(
    event: AudioPlayerEventType,
    listener: AudioPlayerEventListener
  ) {
    this._eventListeners[event] = this._eventListeners[event].filter(
      (value) => value !== listener
    );
  }

  private callEvent(event: AudioPlayerEventType, data?: AudioEventData) {
    this._eventListeners[event].forEach((listener) => {
      listener(this, data);
    });
  }
}
