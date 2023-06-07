export interface Authenticatable {
  isAuthenticated(): Promise<boolean>;
  tryLoadAuth(): Promise<boolean>;
  authenticate(key: string): Promise<boolean>;
}

export function isAuthenticatable(object: any): object is Authenticatable {
  const props = ["isAuthenticated", "tryLoadAuth", "authenticate"];
  return props.every((prop) => prop in object);
}
