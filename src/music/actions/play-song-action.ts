import { Music } from "@/src/types/music";
import { Action } from "./action";

export class PlaySongAction extends Action {
  public songId: string;

  constructor(songId: string) {
    super();
    this.songId = songId;
  }

  public toStub(): Music.ActionStub {
    return {
      type: "play song",
      data: this.songId,
    };
  }

  public type(): Music.ActionType {
    return "play song";
  }
}
