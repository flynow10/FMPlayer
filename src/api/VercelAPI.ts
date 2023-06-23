import { USER_TOKEN } from "@/api-lib/_constants";
import { cookieExists } from "../utils/cookies";

export type LoginResponse =
  | { success: true }
  | {
      success: false;
      error?: string;
    };
export enum ApiEndpoint {
  POSTGRES = "/api/postgres",
  AWS = "/api/aws",
  UPLOAD = "/api/upload",
}

export const VercelAPI = {
  /**
   * Only checks if the user token exists, not if it has expired
   */
  quickIsLoggedIn: () => {
    return cookieExists(USER_TOKEN);
  },

  isLoggedIn: async () => {
    if (!VercelAPI.quickIsLoggedIn()) {
      return false;
    }

    try {
      const heartbeatResponse = await (await fetch("/api/heartbeat")).json();
      if (typeof heartbeatResponse === "string") {
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  },

  loginWithPassword: async (password: string): Promise<LoginResponse> => {
    const utf8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return await VercelAPI.loginWithHash(hashHex);
  },

  loginWithHash: async (hash: string): Promise<LoginResponse> => {
    try {
      const responseJson: LoginResponse = await (
        await fetch(`/api/login`, {
          method: "POST",
          body: JSON.stringify({ hash }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();
      if (!responseJson.success) {
        console.warn(responseJson.error);
      }
      return responseJson;
    } catch (e) {
      return {
        success: false,
        error: e?.toString(),
      };
    }
  },

  makeRequest: async <T>(
    endpoint: ApiEndpoint,
    type: string,
    options: object,
    defaultResponse?: T
  ): Promise<T> => {
    const requestUrl = `${endpoint}?${VercelAPI.optionsToUrl({
      type,
      ...options,
    })}`;
    const response = await fetch(requestUrl);
    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error(
        `Failed to make call to ${requestUrl} because the user was logged out`
      );
    }
    const responseJson: object | string = await response.json();
    if (typeof responseJson === "string") {
      console.warn(responseJson);
      if (defaultResponse === undefined) {
        throw new Error(`Failed to make call to ${requestUrl}`);
      }
      return defaultResponse;
    }
    return responseJson as T;
  },

  optionsToUrl(options: object): string {
    const urlSearchParams = new URLSearchParams(
      Object.entries(options).reduce((obj, val) => {
        if (typeof val[1] === "number") {
          obj[val[0]] = val[1].toString(10);
        } else if (!Array.isArray(val[1])) {
          obj[val[0]] = val[1];
        }
        return obj;
      }, {} as Record<string, string>)
    );
    Object.entries(options).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      }
    });
    return urlSearchParams.toString();
  },
};
