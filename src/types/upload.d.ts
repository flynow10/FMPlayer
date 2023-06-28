export namespace Upload {
  type Song = import("@prisma/client").Song;
  export type SetFileMetadataFunction = <T extends keyof Song>(
    fileId: string,
    property: T,
    value: Song[T]
  ) => void;
}
