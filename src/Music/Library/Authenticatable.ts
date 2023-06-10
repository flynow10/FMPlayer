export interface Authenticatable {
  isAuthenticated(): Promise<boolean>;
  authenticate(key: string): Promise<boolean>;
}

export function isAuthenticatable(object: any): object is Authenticatable {
  const props = ["isAuthenticated", "authenticate"];
  return props.every((prop) => prop in object);
}
