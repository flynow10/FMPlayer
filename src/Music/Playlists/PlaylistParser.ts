import { Action } from "../Actions/Action";
import { ActionType } from "../Actions/ActionTypes";
import { LoopAction } from "../Actions/LoopAction";
import { PlaySongAction } from "../Actions/PlaySongAction";
import { ID } from "../Types";
import { ActionSongPair } from "./Playlist";

export class PlaylistParser {
  public actionList: Action[] = [];
  public currentAction: number = 0;
  private readonly TOKEN_MISMATCH = new Error("Token mismatch!");

  parse(actionList: Action[]): ActionSongPair[] {
    return this.parseToSongList(this.parseToAST(actionList));
  }

  parseToSongList(ast: Block): ActionSongPair[] {
    const scope = new Scope();
    ast.walk(scope);
    return scope.songs;
  }

  parseToAST(actionList: Action[]): Block {
    this.actionList = actionList;
    this.currentAction = 0;
    return this.block();
  }

  isTokenType<T extends Action>(action: Action, type: ActionType): action is T {
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
    var nextToken = this.getCurrentToken();
    if (nextToken === null) {
      return block;
    }
    const endBlockTokens = [ActionType.EndCondition, ActionType.EndRepeat];
    while (!endBlockTokens.includes(nextToken.type())) {
      switch (nextToken.type()) {
        case ActionType.PlaySong: {
          block.nodes.push(this.playSong());
          break;
        }
        case ActionType.Repeat: {
          block.nodes.push(this.loop());
          break;
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
    const loopToken = this.stepNextToken()!;
    if (!this.isTokenType<LoopAction>(loopToken, ActionType.Repeat)) {
      throw this.TOKEN_MISMATCH;
    }
    return new Loop(loopToken.count, this.block());
  }

  playSong(): PlaySong {
    const token = this.stepNextToken()!;
    if (!this.isTokenType<PlaySongAction>(token, ActionType.PlaySong)) {
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
  public actionId: ID;

  constructor(type: PlaySongType, value: string, actionId: ID) {
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
  public count: number;
  public block: Block;

  constructor(count: number, block: Block) {
    this.count = count;
    this.block = block;
  }

  public walk(scope: Scope) {
    for (let i = 0; i < this.count; i++) {
      this.block.walk(scope);
    }
  }
}

class Scope {
  public songs: ActionSongPair[];
  constructor() {
    this.songs = [];
  }
}

interface ASTNode {
  walk(scope: Scope): any;
}
