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
}

export function isAuthenticatable(object: any): object is Authenticatable {
  const props = ["isAuthenticated", "authenticate"];
  return props.every((prop) => prop in object);
}
