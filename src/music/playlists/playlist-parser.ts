import { Action } from "@/src/music/actions/action";
import { LoopAction } from "@/src/music/actions/loop-action";
import { NumberAction } from "@/src/music/actions/number-action";
import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { ActionTrackPair } from "./playlist";
import { Music } from "@/src/types/music";

export class PlaylistParser {
  public actionList: Action[] = [];
  public currentAction = 0;
  private readonly TOKEN_MISMATCH = new Error("Token mismatch!");

  parse(actionList: Action[]): ActionTrackPair[] {
    return this.parseToSongList(this.parseToAST(actionList));
  }

  parseToSongList(ast: Block): ActionTrackPair[] {
    const scope = new Scope();
    ast.walk(scope);
    return scope.songs;
  }

  parseToAST(actionList: Action[]): Block {
    this.actionList = actionList;
    this.currentAction = 0;
    return this.block();
  }

  isTokenType<T extends Action>(
    action: Action,
    type: Music.ActionType
  ): action is T {
    if (action.type() === type) {
      return true;
    }

    return false;
  }

  getCurrentToken(): Action | null {
    if (this.currentAction > this.actionList.length - 1) {
      return null;
    }

    return this.actionList[this.currentAction];
  }

  stepNextToken(): Action | null {
    const currentToken = this.getCurrentToken();
    this.currentAction++;
    return currentToken;
  }

  block(): Block {
    const block = new Block();
    let nextToken = this.getCurrentToken();

    if (nextToken === null) {
      return block;
    }

    const endBlockTokens: Music.ActionType[] = ["end loop", "end condition"];

    while (!endBlockTokens.includes(nextToken.type())) {
      switch (nextToken.type()) {
        case "play song": {
          block.nodes.push(this.playSong());
          break;
        }

        case "loop": {
          block.nodes.push(this.loop());
          break;
        }

        default: {
          throw this.TOKEN_MISMATCH;
        }
      }

      nextToken = this.getCurrentToken();

      if (nextToken === null) {
        return block;
      }
    }

    this.stepNextToken();
    return block;
  }

  loop(): Loop {
    const loopToken = this.stepNextToken()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (!this.isTokenType<LoopAction>(loopToken, "loop")) {
      throw this.TOKEN_MISMATCH;
    }

    const number = this.number();
    return new Loop(number, this.block());
  }

  number(): NumberNode {
    const numberToken = this.stepNextToken()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (!this.isTokenType<NumberAction>(numberToken, "number")) {
      throw this.TOKEN_MISMATCH;
    }

    return new NumberNode(numberToken.value);
  }

  playSong(): PlaySong {
    const token = this.stepNextToken()!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (!this.isTokenType<PlaySongAction>(token, "play song")) {
      throw this.TOKEN_MISMATCH;
    }

    return new PlaySong(PlaySongType.SongId, token.songId, token.id);
  }
}

class Block implements ASTNode {
  public nodes: ASTNode[];

  constructor(...nodes: ASTNode[]) {
    this.nodes = nodes;
  }

  walk(scope: Scope) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      node.walk(scope);
    }
  }
}

enum PlaySongType {
  SongId,
  Variable,
}

class PlaySong implements ASTNode {
  public type: PlaySongType;
  public value: string;
  public actionId: string;

  constructor(type: PlaySongType, value: string, actionId: string) {
    this.type = type;
    this.value = value;
    this.actionId = actionId;
  }

  walk(scope: Scope) {
    if (this.type === PlaySongType.SongId) {
      scope.songs.push({ songId: this.value, actionId: this.actionId });
    }
  }
}

class Loop implements ASTNode {
  public count: ASTNode;
  public block: Block;

  constructor(count: ASTNode, block: Block) {
    this.count = count;
    this.block = block;
  }

  public walk(scope: Scope) {
    for (let i = 0; i < this.count.walk(scope); i++) {
      this.block.walk(scope);
    }
  }
}

class NumberNode implements ASTNode {
  public value: number;

  constructor(value: number) {
    this.value = value;
  }

  public walk() {
    return this.value;
  }
}

class Scope {
  public songs: ActionTrackPair[];
  constructor() {
    this.songs = [];
  }
}

interface ASTNode {
  walk(scope: Scope): any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
