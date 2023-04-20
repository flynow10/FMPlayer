import { v4 as uuid } from "uuid";
import { IAuthoredWork, ICoverImage, ID, IMedia, MediaType } from "./Types";

export class Album implements IAuthoredWork, ICoverImage, IMedia {
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

  public getMediaType(): MediaType {
    return MediaType.Album;
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
