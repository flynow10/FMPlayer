import { Album, Song } from "@prisma/client";
import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import { PostgresRequest } from "@/src/types/postgres-request";
import { Music } from "@/src/types/music";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";

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

  public async uploadFile(file: Music.Files.PreUploadFile): Promise<Song> {
    const uploadResult = await VercelAPI.makeRequest<
      PostgresRequest.UploadFileResponse,
      PostgresRequest.UploadFileBody
    >(Endpoint.UPLOAD, "uploadFile", {
      file: file.audioData.fileType,
      metadata: file.metadata,
    });
    this.sendS3Post(uploadResult.post, file.audioData);
    return uploadResult.song;
  }

  public async downloadYoutubeVideo(
    videoId: string,
    metadata: Music.Files.EditableMetadata
  ): Promise<Song> {
    const { song }: PostgresRequest.DownloadYoutubeVideoResponse =
      await VercelAPI.makeRequest<
        PostgresRequest.DownloadYoutubeVideoResponse,
        PostgresRequest.DownloadYoutubeVideoBody
      >(Endpoint.UPLOAD, "downloadYoutubeVideo", {
        video: {
          id: videoId,
        },
        metadata: metadata,
      });
    return song;
  }

  private async sendS3Post(post: PresignedPost, body: Music.Files.AudioData) {
    const form = new FormData();
    Object.entries(post.fields).forEach(([field, value]) => {
      form.append(field, value);
    });
    form.append("file", new Blob([body.buffer], { type: body.fileType.mime }));
    await fetch(post.url, {
      body: form,
      method: "POST",
    });
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
