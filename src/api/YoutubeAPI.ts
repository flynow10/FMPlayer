type Cache = {
  search: { [key: string]: SearchResultList };
  video: { [key: string]: VideoResultList };
};

type CacheType = keyof Cache;
class YoutubeAPISingleton {
  public loaded: boolean = false;
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
      } as any);
      this.loaded = true;
    } catch (e) {
      console.warn("Unable to connect to Google Cloud");
    }
    return this.loaded;
  }
  public async video(id: string) {
    if (!this.loaded) return null;
    const cacheResponse = this.getCacheResponse<VideoResultList>("video", id);
    if (cacheResponse) {
      return cacheResponse;
    }
    try {
      const response = await gapi.client.request({
        path: `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${id}`,
      });
      const videoResult: VideoResultList = response.result;
      this.cache.video[id] = videoResult;
      return videoResult;
    } catch (reason) {
      console.log("Error: " + reason);
      return null;
    }
  }

  public async search(searchTerm: string, maxResults: number = 5) {
    searchTerm = searchTerm.trim();
    if (!searchTerm || searchTerm === "") {
      return null;
    }
    const cacheResponse = this.getCacheResponse<SearchResultList>(
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
      const searchResult: SearchResultList = response.result;
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

export type ResourceId = {
  kind: "youtube#video";
  videoId: string;
};
// | {
//     kind: "youtube#channel";
//     channelId: string;
//   }
// | {
//     kind: "youtube#playlist";
//     playlistId: string;
//   };

export type ThumbnailDetails = {
  medium?: Thumbnail;
  maxres?: Thumbnail;
  standard?: Thumbnail;
  default?: Thumbnail;
  high?: Thumbnail;
};

export type Thumbnail = {
  width: number;
  height: number;
  url: string;
};

export type PageInfo = {
  totalResults: number;
  resultsPerPage: number;
};

export type AccessPolicy = {
  allowed: boolean;
  exception: string[];
};

export type LiveBroadcastEnum = "none" | "upcoming" | "live" | "completed";

export type VideoResultList = {
  kind: "youtube#videoListResponse";
  etag: string;
  eventId?: string;
  visitorId?: string;
  nextPageToken?: string;
  prevPageToken?: string;
  items: Video[];
  pageInfo: PageInfo;
};

export type Video = {
  kind: "youtube#video";
  etag: string;
  id: string;
  snippet: VideoSnippet;
  contentDetails: VideoContentDetails;
  statistics: VideoStatistics;
};

export type VideoSnippet = {
  liveBroadcastContent: LiveBroadcastEnum;
  publishedAt: string;
  description: string;
  thumbnails: ThumbnailDetails;
  channelTitle: string;
  defaultLanguage: string;
  localized: VideoLocalization;
  channelId: string;
  title: string;
  defaultAudioLanguage: string;
  tags: string[];
  categoryId: string;
};

export type VideoLocalization = {
  title: string;
  description: string;
};

export type VideoContentDetails = {
  dimension: string;
  duration: string;
  contentRating: {
    mpaaRating?:
      | "mpaaUnspecified"
      | "mpaaG"
      | "mpaaPg"
      | "mpaaPg13"
      | "mpaaR"
      | "mpaaNc17"
      | "mpaaX"
      | "mpaaUnrated";
  };
  hasCustomThumbnail?: boolean;
  regionRestriction?: {
    blocked: string[];
    allowed: string[];
  };
  projection: "rectangular" | "360";
  definition: "sd" | "hd";
  caption: "true" | "false";
  countryRestriction?: AccessPolicy;
  licensedContent: boolean;
};

export type VideoStatistics = {
  dislikeCount?: string;
  likeCount: string;
  viewCount: string;
  commentCount: string;
  favoriteCount: string;
};

export type SearchResultList = {
  kind: "youtube#searchListResponse";
  etag: string;
  eventId?: string;
  visitorId?: string;
  regionCode: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: PageInfo;
  items: SearchResult[];
};

export type SearchResult = {
  kind: "youtube#searchResult";
  id: ResourceId;
  etag: string;
  snippet: SearchResultSnippet;
};

export type SearchResultSnippet = {
  publishedAt: string;
  description: string;
  thumbnails: ThumbnailDetails;
  channelId: string;
  channelTitle: string;
  title: string;
  liveBroadcastContent: LiveBroadcastEnum;
};
