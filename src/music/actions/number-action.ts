import { Music } from "@/src/types/music";
import { Action } from "./action";

export class NumberAction extends Action {
  public value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  public toStub(): Music.ActionStub {
    return { type: "number", data: this.value.toString() };
  }

  public type(): Music.ActionType {
    return "number";
  }
}
