import { v4 as uuid } from "uuid";
import { ActionStub, ActionType } from "./action-types";

export abstract class Action {
  public id: string;
  constructor() {
    this.id = uuid();
  }
  public abstract toStub(): ActionStub;
  public abstract type(): ActionType;
}
