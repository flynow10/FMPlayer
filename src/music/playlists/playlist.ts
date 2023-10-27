import { v4 as uuid } from "uuid";
import { Action } from "@/src/music/actions/action";
import { PlaylistParser } from "./playlist-parser";
import { Music } from "@/src/types/music";

export type ActionTrackPair = { songId: string; actionId: string };

export class Playlist {
  public id: string;
  private _actionList: Action[];
  public trackList: ActionTrackPair[];

  public get actionList() {
    return [...this._actionList];
  }

  constructor() {
    this.id = uuid();
    this._actionList = [];
    this.trackList = [];
  }

  public regenerateSongList() {
    const parser = new PlaylistParser();
    this.trackList = parser.parse(this._actionList);
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

  public getMediaType(): Music.MediaType {
    return "playlist";
  }

  public static Blank() {
    return new Playlist();
  }
}
