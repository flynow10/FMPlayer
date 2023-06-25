import { Music } from "@/src/types/music";
import { v4 as uuid } from "uuid";

export abstract class Action {
  public id: string;
  constructor() {
    this.id = uuid();
  }
  public abstract toStub(): Music.ActionStub;
  public abstract type(): Music.ActionType;
}
