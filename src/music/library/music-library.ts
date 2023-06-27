import { Album, Song } from "@prisma/client";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import { PostgresRequest } from "@/src/types/postgres-request";

class PostgresMusicLibrary {
  public async getSong(
    id: string
  ): Promise<PostgresRequest.SongWithAlbum | undefined> {
    return VercelAPI.makeRequest(
      Endpoint.POSTGRES,
      "getSong",
      { id },
      undefined
    );
  }

  public async getAlbum(
    id: string
  ): Promise<PostgresRequest.AlbumWithSongs | undefined> {
    return VercelAPI.makeRequest(
      Endpoint.POSTGRES,
      "getAlbum",
      { id },
      undefined
    );
  }

  public async getSongList(
    options: Partial<PostgresRequest.SongListOptions> = {}
  ): Promise<Song[]> {
    return VercelAPI.makeRequest(Endpoint.POSTGRES, "getSongList", options, []);
  }

  public async getAlbumList(
    options: Partial<PostgresRequest.AlbumListOptions> = {}
  ): Promise<Album[]> {
    return VercelAPI.makeRequest(
      Endpoint.POSTGRES,
      "getAlbumList",
      options,
      []
    );
  }

  public async getGenreList(): Promise<PostgresRequest.GenreListResponse[]> {
    return VercelAPI.makeRequest(Endpoint.POSTGRES, "getGenreList", {}, []);
  }

  public async getGenreMedia(
    genre: string
  ): Promise<PostgresRequest.GenreMediaResponse> {
    return VercelAPI.makeRequest(
      Endpoint.POSTGRES,
      "getGenreMedia",
      { genre },
      {
        genre: "",
        songs: [],
        albums: [],
      }
    );
  }

  public async getArtistlist(): Promise<PostgresRequest.ArtistListResponse[]> {
    return VercelAPI.makeRequest(Endpoint.POSTGRES, "getArtistList", {}, []);
  }

  private async uploadFileToConvert(
    fileName: string,
    fileType: string,
    file: Blob
  ): Promise<void> {
    const presignedUrl: PresignedPost = await VercelAPI.makeRequest(
      Endpoint.AWS,
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
        Endpoint.AWS,
        "songUrl",
        { id },
        { url: "" }
      )
    ).url;
    return url !== "" ? url : undefined;
  }
}

export const MyMusicLibrary: PostgresMusicLibrary = new PostgresMusicLibrary();
