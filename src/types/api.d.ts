export namespace API {
  export namespace Vercel {
    export type LoginResponse =
      | { success: true }
      | {
          success: false;
          error?: string;
        };
  }

  export namespace Youtube {
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

    export type ChannelResultList = {
      kind: "youtube#channelListResponse";
      etag: string;
      eventId: string;
      visitorId: string;
      nextPageToken: string;
      prevPageToken: string;
      pageInfo: PageInfo;
      items: Channel[];
    };

    export type Channel = {
      etag: string;
      id: string;
      kind: "youtube#channel";
      snippet: ChannelSnippet;
      statistics: ChannelStatistics;
    };

    export type ChannelSnippet = {
      title: string;
      customUrl: string;
      publishedAt: string;
      defaultLanguage: string;
      country: string;
      thumbnails: ThumbnailDetails;
      description: string;
      localized: ChannelLocalization;
    };

    export type ChannelLocalization = {
      title: string;
      description: string;
    };

    export type ChannelStatistics = {
      /**
       * Uint64 number
       */
      commentCount: string;
      hiddenSubscriberCount: boolean;
      /**
       * Uint64 number
       */
      subscriberCount: string;
      /**
       * Uint64 number
       */
      viewCount: string;
      /**
       * Uint64 number
       */
      videoCount: string;
    };
  }
}
