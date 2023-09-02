import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import { Music } from "@/src/types/music";

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

export function createAudioMethods(): AudioMethods {
  return {
    async getAudioFileUrl(trackId) {
      const url = (
        await VercelAPI.makeRequest<{ url: string }>(
          Endpoint.AWS,
          { trackId },
          "",
          "GET",
          { url: "" }
        )
      ).url;
      return url !== "" ? url : null;
    },
    async uploadAudioData(audioData, trackId) {
      console.log(
        `New Upload (AudioType: "${audioData.fileType.mime}", TrackId: "${trackId}")`
      );
      return true;
    },
    async downloadYoutubeVideo(videoId, trackId) {
      console.log(
        `New Video Download (VideoId: "${videoId}", TrackId: "${trackId}")`
      );
      return true;
    },
  };
}
