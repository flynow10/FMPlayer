import { Action } from "./Action";
import { EndLoopAction, LoopAction } from "./LoopAction";
import { PlaySongAction } from "./PlaySongAction";

export enum ActionType {
  PlaySong,
  Repeat,
  EndRepeat,
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
    case ActionType.Repeat: {
      return new LoopAction(parseInt(stub.data));
    }
    case ActionType.EndRepeat: {
      return new EndLoopAction();
    }
    default: {
      throw new Error("Action stub type is not valid!");
    }
  }
}
