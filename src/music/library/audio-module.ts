import { Endpoint, VercelAPI } from "@/src/api/vercel-API";

export type AudioMethods = {
  getAudioFileUrl(trackId: string): Promise<string | null>;
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
  };
}
