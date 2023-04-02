import { v4 as uuid } from "uuid";
import { AuthoredWork, ID } from "./Types";

export class Album implements AuthoredWork {
  public id: ID;
  public title: string;
  public artists?: string[];
  public featuring?: string[];
  public songs: ID[];
  public coverUrl?: string;

  public constructor() {
    this.id = uuid();
    this.title = "Missing Title";
    this.artists = [];
    this.featuring = [];
    this.songs = [];
    this.coverUrl = "";
  }

  public static fromData(data: AlbumJson): Album {
    return Object.assign(new Album(), data);
  }
}

export interface AlbumJson {
  id: ID;
  title: string;
  artists?: string[];
  featuring?: string[];
  songs: ID[];
  coverUrl?: string;
}
