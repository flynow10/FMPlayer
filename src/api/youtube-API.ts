import { API } from "@/src/types/api";

type Cache = {
  search: { [key: string]: API.Youtube.SearchResultList };
  video: { [key: string]: API.Youtube.VideoResultList };
};

type CacheType = keyof Cache;
class YoutubeAPISingleton {
  public loaded = false;
  private cache: Cache = {
    search: {},
    video: {},
  };

  private getCacheResponse<T>(type: CacheType, key: string): T | null {
    if (key in this.cache[type]) {
      return this.cache[type][key] as T;
    }

    return null;
  }
  public async load() {
    try {
      await new Promise((resolve, reject) => {
        gapi.load("client", {
          callback: () => {
            resolve(null);
          },
          onerror: reject,
          ontimeout: reject,
          timeout: 3000,
        });
      });
      await gapi.client.init({
        apiKey: "AIzaSyC7lJPoPpw-U0IVzpZX5Un2X1fqG3SdQG0",
        cookiepolicy: "single_host_origin",
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      this.loaded = true;
    } catch (e) {
      console.warn("Unable to connect to Google Cloud");
    }

    return this.loaded;
  }
  public async video(id: string) {
    if (!this.loaded) return null;
    const cacheResponse = this.getCacheResponse<API.Youtube.VideoResultList>(
      "video",
      id
    );

    if (cacheResponse) {
      return cacheResponse;
    }

    try {
      const response = await gapi.client.request({
        path: `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${id}`,
      });
      const videoResult: API.Youtube.VideoResultList = response.result;
      this.cache.video[id] = videoResult;
      return videoResult;
    } catch (reason) {
      console.log("Error: " + reason);
      return null;
    }
  }

  public async search(searchTerm: string, maxResults = 5) {
    searchTerm = searchTerm.trim();

    if (!searchTerm || searchTerm === "") {
      return null;
    }

    const cacheResponse = this.getCacheResponse<API.Youtube.SearchResultList>(
      "search",
      searchTerm
    );

    if (cacheResponse) {
      return cacheResponse;
    }

    try {
      const response = await gapi.client.request({
        path: `https://youtube.googleapis.com/youtube/v3/search?type=video&part=snippet&maxResults=${maxResults}&type=video&q=${searchTerm}`,
      });
      const searchResult: API.Youtube.SearchResultList = response.result;
      this.cache.search[searchTerm] = searchResult;
      return searchResult;
    } catch (reason) {
      console.log("Error: " + reason);
      return null;
    }
  }

  public async searchSuggestions(
    incompleteSearch: string
  ): Promise<{ suggestions: string[]; search: string }> {
    if (incompleteSearch === "") {
      return {
        suggestions: [],
        search: incompleteSearch,
      };
    }

    const response = await fetch(
      `/proxy/complete/search?client=firefox&ds=yt&q=${incompleteSearch}`
    );
    return {
      suggestions: (await response.json())[1],
      search: incompleteSearch,
    };
  }
}

export const YoutubeAPI = new YoutubeAPISingleton();
