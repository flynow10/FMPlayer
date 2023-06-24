import { Action } from "./action";
import { EndLoopAction, LoopAction } from "./loop-action";
import { NumberAction } from "./number-action";
import { PlaySongAction } from "./play-song-action";

export enum ActionType {
  PlaySong,
  Number,
  Loop,
  EndLoop,
  Condition,
  EndCondition,
}

export type ActionStub = {
  type: ActionType;
  data: string;
};

export function createFromStub(stub: ActionStub): Action {
  switch (stub.type) {
    case ActionType.PlaySong: {
      return new PlaySongAction(stub.data);
    }
    case ActionType.Number: {
      return new NumberAction(parseInt(stub.data));
    }
    case ActionType.Loop: {
      return new LoopAction();
    }
    case ActionType.EndLoop: {
      return new EndLoopAction();
    }
    default: {
      throw new Error("Action stub type is not valid!");
    }
  }
}
