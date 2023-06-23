import { Album, Song } from "@prisma/client";
import {
  AlbumListOptions,
  AlbumWithSongs,
  GenreListResponse,
  GenreMediaResponse,
  SongListOptions,
  SongWithAlbum,
} from "@/api-lib/_postgres-types";
import { Authenticatable, LoginResponse } from "./Authenticatable";
import { cookieExists } from "@/src/utils/cookies";
import { USER_TOKEN } from "@/api-lib/_constants";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";

enum ApiEndpoint {
  POSTGRES = "/api/postgres",
  AWS = "/api/aws",
}

class PostgresMusicLibrary implements Authenticatable {
  private onLogin: (() => void)[] = [];

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

  public addLoginListener(listener: () => void): void {
    this.onLogin.push(listener);
  }

  public removeLoginListener(listener: () => void): void {
    this.onLogin = this.onLogin.filter((v) => v !== listener);
  }

  private async login(hash: string): Promise<LoginResponse> {
    try {
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
        this.onLogin.forEach((listener) => listener());
      }
      return responseJson;
    } catch (e) {
      return {
        success: false,
        error: e?.toString(),
      };
    }
  }

  private async makeRequest<T>(
    endpoint: ApiEndpoint,
    type: string,
    options: object,
    defaultResponse?: T
  ): Promise<T> {
    const requestUrl = `${endpoint}?${this.optionsToUrl({
      type,
      ...options,
    })}`;
    const responseJson: object | string = await (
      await fetch(requestUrl)
    ).json();
    if (typeof responseJson === "string") {
      console.warn(responseJson);
      if (defaultResponse === undefined) {
        throw new Error(`Failed to make call to ${requestUrl}`);
      }
      return defaultResponse;
    }
    return responseJson as T;
  }

  private optionsToUrl(options: object): string {
    const urlSearchParams = new URLSearchParams(
      Object.entries(options).reduce((obj, val) => {
        if (typeof val[1] === "number") {
          obj[val[0]] = val[1].toString(10);
        } else if (!Array.isArray(val[1])) {
          obj[val[0]] = val[1];
        }
        return obj;
      }, {} as Record<string, string>)
    );
    Object.entries(options).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      }
    });
    return urlSearchParams.toString();
  }

  public async getSong(id: string): Promise<SongWithAlbum | undefined> {
    return this.makeRequest(ApiEndpoint.POSTGRES, "getSong", { id }, undefined);
  }

  public async getAlbum(id: string): Promise<AlbumWithSongs | undefined> {
    return this.makeRequest(
      ApiEndpoint.POSTGRES,
      "getAlbum",
      { id },
      undefined
    );
  }

  public async getSongList(
    options: Partial<SongListOptions> = {}
  ): Promise<Song[]> {
    return this.makeRequest(ApiEndpoint.POSTGRES, "getSongList", options, []);
  }

  public async getAlbumList(
    options: Partial<AlbumListOptions> = {}
  ): Promise<Album[]> {
    return this.makeRequest(ApiEndpoint.POSTGRES, "getAlbumList", options, []);
  }

  public async getGenreList(): Promise<GenreListResponse[]> {
    return this.makeRequest(ApiEndpoint.POSTGRES, "getGenreList", {}, []);
  }

  public async getGenreMedia(genre: string): Promise<GenreMediaResponse> {
    return this.makeRequest(
      ApiEndpoint.POSTGRES,
      "getGenreMedia",
      { genre },
      {
        genre: "",
        songs: [],
        albums: [],
      }
    );
  }

  private async uploadFileToConvert(
    fileName: string,
    fileType: string,
    file: Blob
  ): Promise<void> {
    const presignedUrl: PresignedPost = await this.makeRequest(
      ApiEndpoint.AWS,
      "presigned-post",
      {
        fileName: `${fileName}.${fileType}`,
      }
    );
    const formData = new FormData();
    for (const [key, value] of Object.entries(presignedUrl.fields)) {
      formData.append(key, value);
    }
    formData.append("file", file);
    console.log(
      await fetch(presignedUrl.url, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
  }

  public async getMusicFileUrl(id: string): Promise<string | undefined> {
    const url = (
      await this.makeRequest<{ url: string }>(
        ApiEndpoint.AWS,
        "songUrl",
        { id },
        { url: "" }
      )
    ).url;
    return url !== "" ? url : undefined;
  }
}

export const MyMusicLibrary: PostgresMusicLibrary = new PostgresMusicLibrary();
