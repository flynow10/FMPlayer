import { Music } from "@/src/types/music";
import { Action } from "./action";
import { EndLoopAction, LoopAction } from "./loop-action";
import { NumberAction } from "./number-action";
import { PlaySongAction } from "./play-song-action";

export function createFromStub(stub: Music.ActionStub): Action {
  switch (stub.type) {
    case "play song": {
      return new PlaySongAction(stub.data);
    }

    case "number": {
      return new NumberAction(parseInt(stub.data));
    }

    case "loop": {
      return new LoopAction();
    }

    case "end loop": {
      return new EndLoopAction();
    }

    default: {
      throw new Error("Action stub type is not valid!");
    }
  }
}
