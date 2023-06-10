import { Action } from "./Action";
import { ActionStub, ActionType } from "./ActionTypes";

export class PlaySongAction extends Action {
  public songId: string;

  constructor(songId: string) {
    super();
    this.songId = songId;
  }

  public toStub(): ActionStub {
    return {
      type: ActionType.PlaySong,
      data: this.songId,
    };
  }

  public type(): ActionType {
    return ActionType.PlaySong;
  }
}
