export namespace Music {
  export type ActionType =
    | "play song"
    | "number"
    | "loop"
    | "end loop"
    | "condition"
    | "end condition";

  export type MediaType = "song" | "album" | "playlist";

  export type RepeatMode = "none" | "one" | "all";

  export type SongEndBehavior = "stop" | "play";

  export type AudioEvent = () => void;

  export type ActionStub = {
    type: ActionType;
    data: string;
  };
}
