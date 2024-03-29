import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import { Music } from "@/src/types/music";
import { IS_LOCAL } from "@/src/utils/vercel-env";

import { PresignedPost } from "@aws-sdk/s3-presigned-post";

export type AudioMethods = {
  getAudioFileUrl(trackId: string): Promise<string | null>;
  /**
   * @param audioData The raw data of the song file
   * @param trackId The ID of the track that the video should be connected to
   */
  uploadAudioData(
    audioData: Music.Files.AudioData,
    trackId: string
  ): Promise<boolean>;
  /**
   * @param videoId The youtube ID for the video you would like to download
   * @param trackId The ID of the track that the video should be connected to
   */
  downloadYoutubeVideo(videoId: string, trackId: string): Promise<boolean>;
};

function localUploadAlert(trackId: string) {
  alert(
    `Uploads are not automatic on your local machine.
    A track has been added to the database, but the audio data will not be accessible.
    Add a file named ${trackId}.ogg to /static/songs/ to add a song manually.`
  );
}

export function createAudioMethods(): AudioMethods {
  return {
    async getAudioFileUrl(trackId) {
      const response = await VercelAPI.makeRequest(
        Endpoint.AWS,
        { trackId },
        "song-url",
        "GET",
        { url: null }
      );
      return response.url;
    },
    async uploadAudioData(audioData, trackId) {
      if (IS_LOCAL) {
        localUploadAlert(trackId);
        return true;
      }
      const uploadResult = await VercelAPI.makeRequest<PresignedPost>(
        Endpoint.AWS,
        { fileExt: audioData.fileType.ext, fileId: trackId },
        "s3-post",
        "POST"
      );
      if (uploadResult === null) return false;

      const form = new FormData();
      Object.entries(uploadResult.fields).forEach(([field, value]) => {
        form.append(field, value);
      });
      form.append(
        "file",
        new Blob([audioData.buffer], { type: audioData.fileType.mime })
      );
      console.log(
        await fetch(uploadResult.url, {
          body: form,
          method: "POST",
        })
      );
      return true;
    },
    async downloadYoutubeVideo(videoId, trackId) {
      if (IS_LOCAL) {
        localUploadAlert(trackId);
        return true;
      }
      return await VercelAPI.makeRequest(
        Endpoint.AWS,
        { videoId, trackId },
        "download-video",
        "POST",
        false
      );
    },
  };
}
