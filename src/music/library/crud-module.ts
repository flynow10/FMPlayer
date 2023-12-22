import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import {
  cacheResponse,
  findCachedResponse,
} from "@/src/music/library/crud-cache";
import { Music } from "@/src/types/music";
import { Utils } from "@/src/types/utils";
import { fixJsonDateStrings } from "@/src/utils/date-utils";

import { Prisma, PrismaClient } from "@prisma/client";
import hash from "object-hash";

type CreateMethod<T extends keyof Music.DB.TableTypes> = (
  data: Music.DB.PrismaArgs<T, "create">["data"]
) => Promise<Music.DB.TableTypes[T] | null>;

export type GetMethod<T extends keyof Music.DB.TableTypes> = (
  where: Music.DB.PrismaArgs<T, "findUnique">["where"]
) => Promise<Music.DB.TableTypes[T] | null>;

type UpdateMethod<T extends keyof Music.DB.TableTypes> = (
  where: Music.DB.PrismaArgs<T, "update">["where"],
  data: Music.DB.PrismaArgs<T, "update">["data"]
) => Promise<Music.DB.TableTypes[T] | null>;

type DeleteMethod<T extends keyof Music.DB.TableTypes> = (
  where: Music.DB.PrismaArgs<T, "delete">["where"]
) => Promise<Music.DB.TableTypes[T] | null>;

type IncludeResult<
  T extends keyof Music.DB.TableTypes,
  I extends
    | NonNullable<Music.DB.PrismaArgs<T, "findMany">["include"]>
    | undefined = undefined
> = Prisma.Result<
  PrismaClient[Uncapitalize<T>],
  {
    include: I extends undefined ? Music.DB.IncludeParameter<T> : I;
  },
  "findUniqueOrThrow"
>[];
export type ListMethod<T extends keyof Music.DB.TableTypes> = <
  I extends
    | NonNullable<Music.DB.PrismaArgs<T, "findMany">["include"]>
    | undefined = undefined
>(
  where?: Music.DB.PrismaArgs<T, "findMany">["where"],
  include?: I
) => Promise<NonNullable<IncludeResult<T, I>>>;

type CRUDMethods<T extends keyof Music.DB.TableTypes> = {
  create: CreateMethod<T>;
  get: GetMethod<T>;
  update: UpdateMethod<T>;
  delete: DeleteMethod<T>;
  list: ListMethod<T>;
};

export type CRUDObjects = {
  [Key in keyof Music.DB.TableTypes as Uncapitalize<Key>]: CRUDMethods<Key>;
};

function getMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): GetMethod<T> {
  return async function (where) {
    const requestHash = hash(where);

    const cachedResponse = findCachedResponse(table, "get", requestHash);
    if (cachedResponse !== null) {
      return cachedResponse;
    }
    const response: Utils.ReplaceTypes<
      Music.DB.TableTypes[T],
      Date,
      string
    > | null = await VercelAPI.makeRequest(
      Endpoint.DB,
      { ...where },
      table,
      "POST"
    );
    if (response === null) {
      return null;
    }
    const fixedRequest = fixJsonDateStrings(response);

    cacheResponse(
      table,
      "get",
      requestHash,
      fixedRequest as Awaited<Music.DB.TableTypes[T]>
    );
    return fixedRequest;
  };
}

function createMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): CreateMethod<T> {
  return async function (data) {
    const request: Utils.ReplaceTypes<
      Music.DB.TableTypes[T],
      Date,
      string
    > | null = await VercelAPI.makeRequest(
      Endpoint.DB,
      { ...data },
      table,
      "PUT"
    );

    if (request === null) {
      return null;
    }
    return fixJsonDateStrings(request);
  };
}

function updateMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): UpdateMethod<T> {
  return async function (where, data) {
    const request: Utils.ReplaceTypes<
      Music.DB.TableTypes[T],
      Date,
      string
    > | null = await VercelAPI.makeRequest(
      Endpoint.DB,
      { where, data },
      table,
      "PATCH"
    );

    if (request === null) {
      return null;
    }

    return fixJsonDateStrings(request);
  };
}

function deleteMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): DeleteMethod<T> {
  return async function (where) {
    const request: Utils.ReplaceTypes<
      Music.DB.TableTypes[T],
      Date,
      string
    > | null = await VercelAPI.makeRequest(
      Endpoint.DB,
      { ...where },
      table,
      "DELETE"
    );
    if (request === null) {
      return null;
    }
    return fixJsonDateStrings(request);
  };
}

function listMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): ListMethod<T> {
  return async function <
    I extends
      | NonNullable<Music.DB.PrismaArgs<T, "findMany">["include"]>
      | undefined = undefined
  >(where = {}, include?: I) {
    let body: object = { where };
    if (include) {
      body = {
        where,
        include,
      };
    }
    const requestHash = hash(body);
    const cachedResponse = findCachedResponse(table, "list", requestHash);
    if (cachedResponse !== null) {
      return cachedResponse as IncludeResult<T, I>;
    }

    type ArrayElement<A> = A extends Array<infer Element> ? Element : never;
    const response:
      | Utils.ReplaceTypes<ArrayElement<IncludeResult<T, I>>, Date, string>[]
      | null = await VercelAPI.makeRequest(Endpoint.DB, body, table, "GET");
    if (response === null) {
      return [];
    }
    const fixedDates = response.map((value) => {
      return fixJsonDateStrings(value);
    });
    cacheResponse(
      table,
      "list",
      requestHash,
      fixedDates as IncludeResult<
        T,
        | NonNullable<
            Prisma.Args<PrismaClient[Uncapitalize<T>], "findMany">["include"]
          >
        | undefined
      >
    );
    return fixedDates;
  };
}

function createCRUDMethods<T extends keyof Music.DB.TableTypes>(
  table: T
): CRUDMethods<T> {
  return {
    create: createMethodFactory(table),
    get: getMethodFactory(table),
    update: updateMethodFactory(table),
    delete: deleteMethodFactory(table),
    list: listMethodFactory(table),
  };
}

export function createCRUDModule(): CRUDObjects {
  const c = createCRUDMethods;
  const crudObjects: CRUDObjects = {
    album: c("Album"),
    albumArtist: c("AlbumArtist"),
    artist: c("Artist"),
    artwork: c("Artwork"),
    audioSource: c("AudioSource"),
    function: c("Function"),
    genre: c("Genre"),
    playlist: c("Playlist"),
    tag: c("Tag"),
    tagType: c("TagType"),
    track: c("Track"),
    trackArtist: c("TrackArtist"),
    trackInList: c("TrackInList"),
    trackList: c("TrackList"),
  };
  return crudObjects;
}
