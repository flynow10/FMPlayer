import { Action } from "./Action";
import { EndLoopAction, LoopAction } from "./LoopAction";
import { NumberAction } from "./NumberAction";
import { PlaySongAction } from "./PlaySongAction";

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
