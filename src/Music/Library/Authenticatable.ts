import Ably from "ably";

export type LoginResponse =
  | { success: true }
  | {
      success: false;
      error: string;
    };
export interface Authenticatable {
  isAuthenticated(): boolean;
  authenticate(key: string): Promise<LoginResponse>;
  addLoginListener(listener: () => void): void;
  removeLoginListener(listener: () => void): void;
}

export function isAuthenticatable(object: any): object is Authenticatable {
  const props = [
    "isAuthenticated",
    "authenticate",
    "addLoginListener",
    "removeLoginListener",
  ];
  return props.every((prop) => prop in object);
}
