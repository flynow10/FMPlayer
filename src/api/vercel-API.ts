import { API } from "@/src/types/api";

export const VercelAPI = {
  isLoggedIn: async () => {
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

  loginWithPassword: async (
    password: string
  ): Promise<API.Vercel.LoginResponse> => {
    const utf8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return await VercelAPI.loginWithHash(hashHex);
  },

  loginWithHash: async (hash: string): Promise<API.Vercel.LoginResponse> => {
    try {
      const responseJson: API.Vercel.LoginResponse = await (
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

  async makeRequest<T, O = object>(
    endpoint: Endpoint,
    type: string,
    body: O,
    defaultResponse?: T
  ): Promise<T> {
    let response: Response;

    if (endpoint === Endpoint.UPLOAD) {
      response = await VercelAPI._makePOSTRequest(endpoint, type, body);
    } else {
      response = await VercelAPI._makeGETRequest(endpoint, type, body);
    }

    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error(
        `Failed to make call to "${endpoint}?type=${type}" because the user was logged out`
      );
    }

    const responseJson: object | string = await response.json();

    if (typeof responseJson === "string") {
      console.warn(responseJson);

      if (defaultResponse === undefined) {
        throw new Error(`Failed to make call to "${endpoint}?type=${type}"`);
      }

      return defaultResponse;
    }

    return responseJson as T;
  },
  async _makeGETRequest<O>(
    endpoint: Endpoint,
    type: string,
    query: O
  ): Promise<Response> {
    const requestUrl = `${endpoint}?${VercelAPI.optionsToUrl({
      type,
      ...query,
    })}`;
    return fetch(requestUrl, {
      method: "GET",
    });
  },

  async _makePOSTRequest<O>(
    endpoint: Endpoint,
    type: string,
    body: O
  ): Promise<Response> {
    const requestUrl = `${endpoint}?${VercelAPI.optionsToUrl({
      type,
    })}`;
    return fetch(requestUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
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

export enum Endpoint {
  POSTGRES = "/api/postgres",
  AWS = "/api/aws",
  UPLOAD = "/api/upload",
}
