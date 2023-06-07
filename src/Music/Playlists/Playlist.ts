import { v4 as uuid } from "uuid";
import { Action } from "@/Music/Actions/Action";
import { ID, IMedia, MediaType } from "@/Music/Types";
import { PlaylistParser } from "./PlaylistParser";

export type ActionSongPair = { songId: ID; actionId: ID };

export class Playlist implements IMedia {
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
    return this;
  }

  public insertAction(action: Action, index: number) {
    this._actionList.splice(index, 0, action);
    this.regenerateSongList();
    return this;
  }

  public removeAction(action: Action): void;
  public removeAction(index: number): void;

  public removeAction(arg: Action | number) {
    if (arg instanceof Action) {
      this._actionList.splice(this._actionList.indexOf(arg), 1);
    } else if (typeof arg === "number") {
      this._actionList.splice(arg, 1);
    }
    this.regenerateSongList();
    return this;
  }

  public isBlank() {
    return this._actionList.length === 0;
  }

  public getMediaType(): MediaType {
    return MediaType.Playlist;
  }

  public static Blank() {
    return new Playlist();
  }
}
