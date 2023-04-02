import { v4 as uuid } from "uuid";
import { AuthoredWork, FileType, ID } from "./Types";

export interface SongJson {
  id: ID;
  title: string;
  artists?: string[];
  featuring?: string[];
  coverUrl?: string;
  album?: ID;
  duration: number;
  fileType: string;
  trackNumber?: number;
}

export class Song implements AuthoredWork {
  public id: ID;
  public title: string;
  public artists?: string[];
  public featuring?: string[];
  public coverUrl?: string;
  public album?: ID;
  public duration: number;
  public fileType: FileType;
  public trackNumber?: number;

  private constructor() {
    this.id = uuid();
    this.title = "Missing Title";
    this.artists = [];
    this.featuring = [];
    this.coverUrl = "";
    this.duration = 0;
    this.fileType = "mp3";
    this.trackNumber = 1;
  }

  public static fromData(data: SongJson): Song {
    return Object.assign(new Song(), data) as Song;
  }
}
