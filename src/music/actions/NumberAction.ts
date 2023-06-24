import { Action } from "./Action";
import { ActionStub, ActionType } from "./ActionTypes";

export class NumberAction extends Action {
  public value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  public toStub(): ActionStub {
    return { type: ActionType.Number, data: this.value.toString() };
  }

  public type(): ActionType {
    return ActionType.Number;
  }
}
