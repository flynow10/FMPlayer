import { Album, Song } from "@prisma/client";
import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import { PostgresRequest } from "@/src/types/postgres-request";
import { Music } from "@/src/types/music";

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

  public async getArtistList(): Promise<PostgresRequest.ArtistListResponse[]> {
    return VercelAPI.makeRequest<PostgresRequest.ArtistListResponse[]>(
      Endpoint.POSTGRES,
      "getArtistList",
      {},
      []
    );
  }

  public async uploadFile(file: Music.Files.EditableFile): Promise<Song> {
    const uploadResult = await VercelAPI.makeRequest<
      PostgresRequest.UploadFileResponse,
      PostgresRequest.UploadFileBody
    >(Endpoint.UPLOAD, "uploadFile", {
      file: file.audioData.fileType,
      metadata: file.metadata,
    });
    return uploadResult.song;
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
