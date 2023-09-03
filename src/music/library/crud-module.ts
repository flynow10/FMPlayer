import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import { Music } from "@/src/types/music";
import { Prisma, PrismaClient } from "@prisma/client";
import { Operation } from "@prisma/client/runtime/library";

type PrismaArgs<
  T extends keyof Music.DB.TableTypes,
  O extends Operation
> = Prisma.Args<PrismaClient[Uncapitalize<T>], O>;

type CreateMethod<T extends keyof Music.DB.TableTypes> = (
  data: PrismaArgs<T, "create">["data"]
) => Promise<Music.DB.TableTypes[T] | null>;
type GetMethod<T extends keyof Music.DB.TableTypes> = (
  where: PrismaArgs<T, "findUnique">["where"]
) => Promise<Music.DB.TableTypes[T] | null>;
type UpdateMethod<T extends keyof Music.DB.TableTypes> = (
  where: PrismaArgs<T, "update">["where"],
  data: PrismaArgs<T, "update">["data"]
) => Promise<Music.DB.TableTypes[T] | null>;
type DeleteMethod<T extends keyof Music.DB.TableTypes> = (
  where: PrismaArgs<T, "delete">["where"]
) => Promise<Music.DB.TableTypes[T] | null>;
type ListMethod<T extends keyof Music.DB.TableTypes> = (
  where?: PrismaArgs<T, "findMany">["where"]
) => Promise<Music.DB.TableTypes[T][]>;

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
    return await VercelAPI.makeRequest(
      Endpoint.DB,
      { ...where },
      table,
      "POST"
    );
  };
}

function createMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): CreateMethod<T> {
  return async function (data) {
    return await VercelAPI.makeRequest(Endpoint.DB, { ...data }, table, "PUT");
  };
}

function updateMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): UpdateMethod<T> {
  return async function (where, data) {
    return await VercelAPI.makeRequest(
      Endpoint.DB,
      { where, data },
      table,
      "PATCH"
    );
  };
}

function deleteMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): DeleteMethod<T> {
  return async function (where) {
    return await VercelAPI.makeRequest(
      Endpoint.DB,
      { ...where },
      table,
      "DELETE"
    );
  };
}

function listMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): ListMethod<T> {
  return async function (where = {}) {
    return await VercelAPI.makeRequest(
      Endpoint.DB,
      { ...where },
      table,
      "GET",
      []
    );
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
