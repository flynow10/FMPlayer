import { v4 as uuid } from "uuid";
import { Action } from "../Actions/Action";
import { PlaySongAction } from "../Actions/PlaySongAction";
import { ID } from "../Types";
import { PlaylistParser } from "./PlaylistParser";

export type ActionSongPair = { songId: ID; actionId: ID };

export class Playlist {
  public id: ID;
  private _actionList: Action[];
  public songList: ActionSongPair[];

  public get actionList() {
    return [...this._actionList];
  }

  constructor() {
    this.id = uuid();
    this._actionList = [];
    this.songList = [];
  }

  public regenerateSongList() {
    const parser = new PlaylistParser();
    this.songList = parser.parse(this._actionList);
  }

  public addAction(...action: Action[]) {
    this._actionList.push(...action);
    this.regenerateSongList();
  }

  public insertAction(action: Action, index: number) {
    this._actionList.splice(index, 0, action);
    this.regenerateSongList();
  }

  public removeAction(action: Action): void;
  public removeAction(index: number): void;

  public removeAction(arg: Action | number): void {
    if (arg instanceof Action) {
      this._actionList.splice(this._actionList.indexOf(arg), 1);
    } else if (typeof arg === "number") {
      this._actionList.splice(arg, 1);
    }
    this.regenerateSongList();
  }

  public isBlank() {
    return this._actionList.length === 0;
  }

  public static Blank() {
    return new Playlist();
  }
}
