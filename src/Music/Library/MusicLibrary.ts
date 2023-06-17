import { Album, Song } from "@prisma/client";
import {
  AlbumListOptions,
  AlbumWithSongs,
  GenreListResponse,
  GenreMediaResponse,
  SongListOptions,
  SongWithAlbum,
} from "api/_postgres-types";
import { Authenticatable, LoginResponse } from "./Authenticatable";
import { cookieExists } from "@/src/utils/cookies";
import { USER_TOKEN } from "@/lib/_constants";
import { AblyClient } from "./AblyClient";

class PostgresMusicLibrary implements Authenticatable {
  public ably: AblyClient;

  constructor() {
    this.ably = new AblyClient();
    if (this.isAuthenticated()) {
      this.ably.connect();
    }
  }

  public isAuthenticated(): boolean {
    return cookieExists(USER_TOKEN);
  }

  public async authenticate(password: string): Promise<LoginResponse> {
    const utf8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return await this.login(hashHex);
  }

  private async login(hash: string): Promise<LoginResponse> {
    const responseJson: LoginResponse = await (
      await fetch(`/api/login`, {
        method: "POST",
        body: JSON.stringify({ hash }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (!responseJson.success) {
      console.warn(responseJson.error);
    } else {
      this.ably.connect();
    }
    return responseJson;
  }

  public async getSong(id: string): Promise<SongWithAlbum | undefined> {
    const responseJson: SongWithAlbum | string = await (
      await fetch(`/api/postgres?type=getSong&id=${id}`)
    ).json();
    if (typeof responseJson === "string" || responseJson === null) {
      console.warn(responseJson);
      return undefined;
    }
    return responseJson;
  }

  public async getAlbum(id: string): Promise<AlbumWithSongs | undefined> {
    const responseJson: AlbumWithSongs | string = await (
      await fetch(`/api/postgres?type=getAlbum&id=${id}`)
    ).json();
    if (typeof responseJson === "string" || responseJson === null) {
      console.warn(responseJson);
      return undefined;
    }
    return responseJson;
  }

  private optionsToUrl(options: object): string {
    return new URLSearchParams(
      Object.entries(options).reduce((obj, val) => {
        obj[val[0]] = val[1];
        return obj;
      }, {} as Record<string, string>)
    ).toString();
  }

  public async getSongList(
    options: Partial<SongListOptions> = {}
  ): Promise<Song[]> {
    const responseJson: Song[] | string = await (
      await fetch(
        `/api/postgres?${this.optionsToUrl({
          type: "getSongList",
          ...options,
        })}`
      )
    ).json();
    if (typeof responseJson === "string") {
      console.warn(responseJson);
      return [];
    }
    return responseJson;
  }

  public async getAlbumList(
    options: Partial<AlbumListOptions> = {}
  ): Promise<Album[]> {
    const responseJson: Album[] | string = await (
      await fetch(
        `/api/postgres?${this.optionsToUrl({
          ...options,
          type: "getAlbumList",
        })}`
      )
    ).json();
    if (typeof responseJson === "string") {
      console.warn(responseJson);
      return [];
    }
    return responseJson;
  }

  public async getGenreList(): Promise<GenreListResponse[]> {
    const responseJson: GenreListResponse[] | string = await (
      await fetch(`/api/postgres?type=getGenreList`)
    ).json();
    if (typeof responseJson === "string") {
      console.warn(responseJson);
      return [];
    }
    return responseJson;
  }

  public async getGenreMedia(genre: string): Promise<GenreMediaResponse> {
    const responseJson: GenreMediaResponse | string = await (
      await fetch(`/api/postgres?type=getGenreMedia&genre=${genre}`)
    ).json();
    if (typeof responseJson === "string") {
      console.warn(responseJson);
      return {
        genre: "",
        songs: [],
        albums: [],
      };
    }
    return responseJson;
  }

  public async getMusicFileUrl(id: string): Promise<string | undefined> {
    const responseJson: { url: string } | string = await (
      await fetch(`/api/aws?type=songUrl&id=${id}`)
    ).json();
    if (typeof responseJson === "string") {
      console.warn(responseJson);
      return undefined;
    }
    return responseJson.url;
  }
}

export const MyMusicLibrary: PostgresMusicLibrary = new PostgresMusicLibrary();
