import { createCRUDModule, CRUDObjects } from "@/src/music/library/crud-module";
import {
  AudioMethods,
  createAudioMethods,
} from "@/src/music/library/audio-module";
import { Music } from "@/src/types/music";

export type MusicLibrary = {
  db: CRUDObjects;
  audio: AudioMethods;
  uploadTrack(
    metadata: Music.Files.EditableMetadata
  ): Promise<Music.DB.TableType<"Track"> | null>;
};

// class PostgresMusicLibrary {

//   public async uploadFile(file: Music.Files.PreUploadFile): Promise<Song> {
//     const uploadResult = await VercelAPI.makeRequest<
//       PostgresRequest.UploadFileResponse,
//       PostgresRequest.UploadFileBody
//     >(Endpoint.UPLOAD, "uploadFile", {
//       file: file.audioData.fileType,
//       metadata: file.metadata,
//     });
//     this.sendS3Post(uploadResult.post, file.audioData);
//     return uploadResult.song;
//   }

//   public async downloadYoutubeVideo(
//     videoId: string,
//     metadata: Music.Files.EditableMetadata
//   ): Promise<Song> {
//     const { song }: PostgresRequest.DownloadYoutubeVideoResponse =
//       await VercelAPI.makeRequest<
//         PostgresRequest.DownloadYoutubeVideoResponse,
//         PostgresRequest.DownloadYoutubeVideoBody
//       >(Endpoint.UPLOAD, "downloadYoutubeVideo", {
//         video: {
//           id: videoId,
//         },
//         metadata: metadata,
//       });
//     return song;
//   }

//   private async sendS3Post(post: PresignedPost, body: Music.Files.AudioData) {
//     const form = new FormData();
//     Object.entries(post.fields).forEach(([field, value]) => {
//       form.append(field, value);
//     });
//     form.append("file", new Blob([body.buffer], { type: body.fileType.mime }));
//     await fetch(post.url, {
//       body: form,
//       method: "POST",
//     });
//   }

//   public async getMusicFileUrl(id: string): Promise<string | undefined> {
//     const url = (
//       await VercelAPI.makeRequest<{ url: string }>(
//         Endpoint.AWS,
//         "songUrl",
//         { id },
//         { url: "" }
//       )
//     ).url;
//     return url !== "" ? url : undefined;
//   }
// }

export const MusicLibrary: MusicLibrary = (function () {
  const crud = createCRUDModule();
  return {
    db: crud,
    audio: createAudioMethods(),
    uploadTrack(metadata) {
      return MusicLibrary.db.track.create({
        title: metadata.title,
        artists: {
          create: metadata.artists.map((a) => ({
            artist: {
              connectOrCreate: {
                create: {
                  name: a.name,
                },
                where: {
                  name: a.name,
                },
              },
            },
            artistType: a.type,
          })),
        },
        genre: {
          connectOrCreate: {
            create: {
              name: metadata.genre,
            },
            where: {
              name: metadata.genre,
            },
          },
        },
      });
    },
  };
})();
