import { Endpoint, VercelAPI } from "@/src/api/vercel-API";
import { Music } from "@/src/types/music";
import { Prisma, PrismaClient } from "@prisma/client";

type CreateMethod<T extends keyof Music.DB.TableTypes> = (
  data: Music.DB.PrismaArgs<T, "create">["data"]
) => Promise<Music.DB.TableTypes[T] | null>;
type GetMethod<T extends keyof Music.DB.TableTypes> = (
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
  "findMany"
>;
type ListMethod<T extends keyof Music.DB.TableTypes> = <
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

// https://stackoverflow.com/questions/72190916/replace-a-specific-type-with-another-type-in-a-nested-object-typescript
type ReplaceTypes<ObjType extends object, FromType, ToType> = {
  [KeyType in keyof ObjType]: ObjType[KeyType] extends object
    ? ReplaceTypes<ObjType[KeyType], FromType, ToType> // Recurse
    : ObjType[KeyType] extends FromType // Not recursing, need to change?
    ? ToType // Yes, change it
    : ObjType[KeyType]; // No, keep original
};

function fixJsonDateStrings<TypeWithDate extends object>(
  input: ReplaceTypes<TypeWithDate, Date, string>
): TypeWithDate {
  const output: Partial<TypeWithDate> = {};
  (
    Object.entries(input) as Array<
      [
        keyof TypeWithDate,
        ReplaceTypes<TypeWithDate, Date, string>[keyof TypeWithDate]
      ]
    >
  ).forEach(([key, value]) => {
    if (!value) {
      output[key] = value as TypeWithDate[typeof key];
      return;
    }
    if (Array.isArray(value)) {
      output[key] = value.map((value) =>
        fixJsonDateStrings(value)
      ) as TypeWithDate[typeof key];
      return;
    }
    if (typeof value === "object") {
      output[key] = fixJsonDateStrings<typeof value>(
        value as ReplaceTypes<typeof value, Date, string>
      ) as TypeWithDate[typeof key];
      return;
    }
    if (typeof value === "string") {
      // https://stackoverflow.com/a/14322189
      if (
        value.match(
          /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/
        ) !== null
      ) {
        output[key] = new Date(value) as TypeWithDate[typeof key];
        return;
      }
    }
    output[key] = value as TypeWithDate[typeof key];
  });
  return output as TypeWithDate;
}

function getMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): GetMethod<T> {
  return async function (where) {
    const request: ReplaceTypes<Music.DB.TableTypes[T], Date, string> | null =
      await VercelAPI.makeRequest(Endpoint.DB, { ...where }, table, "POST");
    if (request === null) {
      return null;
    }
    return fixJsonDateStrings(request);
  };
}

function createMethodFactory<T extends keyof Music.DB.TableTypes>(
  table: T
): CreateMethod<T> {
  return async function (data) {
    const request: ReplaceTypes<Music.DB.TableTypes[T], Date, string> | null =
      await VercelAPI.makeRequest(Endpoint.DB, { ...data }, table, "PUT");

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
    const request: ReplaceTypes<Music.DB.TableTypes[T], Date, string> | null =
      await VercelAPI.makeRequest(Endpoint.DB, { where, data }, table, "PATCH");

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
    const request: ReplaceTypes<Music.DB.TableTypes[T], Date, string> | null =
      await VercelAPI.makeRequest(Endpoint.DB, { ...where }, table, "DELETE");
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
    return (
      await VercelAPI.makeRequest(Endpoint.DB, body, table, "GET", [])
    ).map((value) => fixJsonDateStrings(value)) as IncludeResult<T, I>;
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
