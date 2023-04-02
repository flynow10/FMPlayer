import { v4 as uuid } from "uuid";
import { ID } from "../Types";
import { ActionStub, ActionType } from "./ActionTypes";

export abstract class Action {
  public id: ID;
  constructor() {
    this.id = uuid();
  }
  public abstract toStub(): ActionStub;
  public abstract type(): ActionType;
}
