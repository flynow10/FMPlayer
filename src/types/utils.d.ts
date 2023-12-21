export namespace Utils {
  export type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> &
    Partial<Pick<Type, Key>>;

  export type MakeRequired<Type, Key extends keyof Type> = Type & {
    [P in Key]-?: Type[P];
  };

  // https://stackoverflow.com/questions/72190916/replace-a-specific-type-with-another-type-in-a-nested-object-typescript
  export type ReplaceTypes<ObjType extends object, FromType, ToType> = {
    [KeyType in keyof ObjType]: ObjType[KeyType] extends object
      ? ReplaceTypes<ObjType[KeyType], FromType, ToType> // Recurse
      : ObjType[KeyType] extends FromType // Not recursing, need to change?
      ? ToType // Yes, change it
      : ObjType[KeyType]; // No, keep original
  };
}
