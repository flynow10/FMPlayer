import { Action } from "./action";
import { ActionStub, ActionType } from "./action-types";

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
