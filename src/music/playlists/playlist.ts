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
    const newPlaylist = this.copy();
    newPlaylist._actionList.push(...action);
    newPlaylist.regenerateSongList();
    return newPlaylist;
  }

  public insertAction(index: number, ...actions: Action[]) {
    const newPlaylist = this.copy();
    newPlaylist._actionList.splice(index, 0, ...actions);
    newPlaylist.regenerateSongList();
    return newPlaylist;
  }

  public removeAction(action: Action): void;
  public removeAction(index: number): void;

  public removeAction(arg: Action | number) {
    const newPlaylist = this.copy();
    if (arg instanceof Action) {
      newPlaylist._actionList.splice(this._actionList.indexOf(arg), 1);
    } else if (typeof arg === "number") {
      newPlaylist._actionList.splice(arg, 1);
    }

    newPlaylist.regenerateSongList();
    return newPlaylist;
  }

  public isBlank() {
    return this._actionList.length === 0;
  }

  public getMediaType(): Music.MediaType {
    return "playlist";
  }

  public copy(): Playlist {
    const newPlaylist = new Playlist();
    newPlaylist.id = this.id;
    newPlaylist._actionList = [...this.actionList];
    newPlaylist.regenerateSongList();
    return newPlaylist;
  }

  public static Blank() {
    return new Playlist();
  }
}
