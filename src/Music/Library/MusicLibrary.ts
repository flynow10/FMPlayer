import { Album, Song } from "@prisma/client";
import { Authenticatable } from "./Authenticatable";
import {
  AlbumListOptions,
  GenreListResponse,
  GenreMediaResponse,
  SongListOptions,
} from "api/_postgres-types";

class PostgresMusicLibrary implements Authenticatable {
  public async tryLoadAuth(): Promise<boolean> {
    const hash = localStorage.getItem("hash");
    return hash !== null && (await this.login(hash));
  }

  public async isAuthenticated(): Promise<boolean> {
    return (await (await fetch("/api/tryAuth")).json()) === true;
  }

  public async authenticate(key: string): Promise<boolean> {
    const utf8 = new TextEncoder().encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    const valid = await this.login(hashHex);
    if (!valid) return false;
    localStorage.setItem("hash", hashHex);
    return true;
  }

  private async login(hash: string): Promise<boolean> {
    const { success } = await (await fetch(`/api/login?p=${hash}`)).json();
    return success;
  }

  public async getSong(id: string): Promise<Song | undefined> {
    const responseJson: Song | string = await (
      await fetch(`/api/postgres?type=getSong&id=${id}`)
    ).json();
    if (typeof responseJson === "string" || responseJson === null) {
      console.warn(responseJson);
      return undefined;
    }
    return responseJson;
  }

  public async getAlbum(id: string): Promise<Album | undefined> {
    const responseJson: Album | string = await (
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
