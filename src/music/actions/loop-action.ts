import { Action } from "./action";
import { ActionStub, ActionType } from "./action-types";

export class LoopAction extends Action {
  constructor() {
    super();
  }

  public toStub(): ActionStub {
    return {
      type: ActionType.Loop,
      data: "",
    };
  }

  public type(): ActionType {
    return ActionType.Loop;
  }
}

export class EndLoopAction extends Action {
  public toStub(): ActionStub {
    return {
      type: ActionType.EndLoop,
      data: "",
    };
  }

  public type(): ActionType {
    return ActionType.EndLoop;
  }
}
