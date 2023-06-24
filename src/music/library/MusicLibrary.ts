import { Album, Song } from "@prisma/client";
import {
  AlbumListOptions,
  AlbumWithSongs,
  GenreListResponse,
  GenreMediaResponse,
  SongListOptions,
  SongWithAlbum,
} from "@/api-lib/_postgres-types";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { ApiEndpoint, VercelAPI } from "@/src/api/VercelAPI";

class PostgresMusicLibrary {
  public async getSong(id: string): Promise<SongWithAlbum | undefined> {
    return VercelAPI.makeRequest(
      ApiEndpoint.POSTGRES,
      "getSong",
      { id },
      undefined
    );
  }

  public async getAlbum(id: string): Promise<AlbumWithSongs | undefined> {
    return VercelAPI.makeRequest(
      ApiEndpoint.POSTGRES,
      "getAlbum",
      { id },
      undefined
    );
  }

  public async getSongList(
    options: Partial<SongListOptions> = {}
  ): Promise<Song[]> {
    return VercelAPI.makeRequest(
      ApiEndpoint.POSTGRES,
      "getSongList",
      options,
      []
    );
  }

  public async getAlbumList(
    options: Partial<AlbumListOptions> = {}
  ): Promise<Album[]> {
    return VercelAPI.makeRequest(
      ApiEndpoint.POSTGRES,
      "getAlbumList",
      options,
      []
    );
  }

  public async getGenreList(): Promise<GenreListResponse[]> {
    return VercelAPI.makeRequest(ApiEndpoint.POSTGRES, "getGenreList", {}, []);
  }

  public async getGenreMedia(genre: string): Promise<GenreMediaResponse> {
    return VercelAPI.makeRequest(
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
    const presignedUrl: PresignedPost = await VercelAPI.makeRequest(
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
      await VercelAPI.makeRequest<{ url: string }>(
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
