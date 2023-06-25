import { Music } from "@/src/types/music";
import { Action } from "./action";

export class LoopAction extends Action {
  constructor() {
    super();
  }

  public toStub(): Music.ActionStub {
    return {
      type: "loop",
      data: "",
    };
  }

  public type(): Music.ActionType {
    return "loop";
  }
}

export class EndLoopAction extends Action {
  public toStub(): Music.ActionStub {
    return {
      type: "end loop",
      data: "",
    };
  }

  public type(): Music.ActionType {
    return "end loop";
  }
}
