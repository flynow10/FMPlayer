import { Action } from "./Action";
import { ActionStub, ActionType } from "./ActionTypes";

export class LoopAction extends Action {
  public count: number;

  constructor(count: number) {
    super();
    this.count = count;
  }

  public toStub(): ActionStub {
    return {
      type: ActionType.Repeat,
      data: this.count.toString(),
    };
  }

  public type(): ActionType {
    return ActionType.Repeat;
  }
}

export class EndLoopAction extends Action {
  public toStub(): ActionStub {
    return {
      type: ActionType.EndRepeat,
      data: "",
    };
  }

  public type(): ActionType {
    return ActionType.EndRepeat;
  }
}
