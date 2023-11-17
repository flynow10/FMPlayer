import { RealtimeStatus } from "@/src/api/ably-client";
import { GetMethod, ListMethod } from "@/src/music/library/crud-module";
import { Music } from "@/src/types/music";
import { AblyMessage } from "fm-player-shared";
type CacheableRequestTypes<T extends keyof Music.DB.TableTypes> = {
  list: ListMethod<T>;
  get: GetMethod<T>;
};

type ResponseType<
  T extends keyof Music.DB.TableTypes,
  RequestType extends keyof CacheableRequestTypes<T>
> = Awaited<ReturnType<CacheableRequestTypes<T>[RequestType]>>;

type CacheObject<
  T extends keyof Music.DB.TableTypes,
  RequestType extends keyof CacheableRequestTypes<T>
> = Record<string, ResponseType<T, RequestType>>;

type CacheTable<T extends keyof Music.DB.TableTypes> = {
  [ReqType in keyof CacheableRequestTypes<T>]: CacheObject<T, ReqType>;
};

type RequestCache = {
  [T in keyof Music.DB.TableTypes]: CacheTable<T>;
};

const createCache = <T extends keyof Music.DB.TableTypes>(): CacheTable<T> => ({
  get: {},
  list: {},
});
const cache: RequestCache = {
  Album: createCache(),
  AlbumArtist: createCache(),
  Artist: createCache(),
  AudioSource: createCache(),
  Function: createCache(),
  Genre: createCache(),
  Playlist: createCache(),
  Tag: createCache(),
  TagType: createCache(),
  Track: createCache(),
  TrackArtist: createCache(),
  TrackInList: createCache(),
  TrackList: createCache(),
  Artwork: createCache(),
};

const subscribedTables: (keyof Music.DB.TableTypes)[] = [];

export function cacheResponse<
  T extends keyof Music.DB.TableTypes,
  RequestType extends keyof CacheableRequestTypes<T>
>(
  table: T,
  requestType: RequestType,
  requestKey: string,
  response: NonNullable<
    Awaited<ReturnType<CacheableRequestTypes<T>[RequestType]>>
  >
) {
  cache[table][requestType][requestKey] = response;
  subscribeToTableUpdates(table);
}

function subscribeToTableUpdates<T extends keyof Music.DB.TableTypes>(
  table: T
) {
  if (!subscribedTables.includes(table)) {
    RealtimeStatus.databaseUpdatesChannel.subscribe((msg) => {
      if (table === (msg.model as Music.DB.TableName)) {
        if (msg.changeType === AblyMessage.DatabaseChanges.ChangeType.CREATE) {
          cache[table]["list"] = {};
        } else {
          invalidateCache(table);
        }
      }
    }, "status");
    subscribedTables.push(table);
  }
}

function invalidateCache<T extends keyof Music.DB.TableTypes>(table: T) {
  cache[table] = {
    get: {},
    list: {},
  };
}

export function findCachedResponse<
  T extends keyof Music.DB.TableTypes,
  RequestType extends keyof CacheableRequestTypes<T>
>(
  table: T,
  requestType: RequestType,
  requestKey: string
): ResponseType<T, RequestType> | null {
  if (requestKey in cache[table][requestType]) {
    return cache[table][requestType][requestKey] as ResponseType<
      T,
      RequestType
    >;
  }
  return null;
}
