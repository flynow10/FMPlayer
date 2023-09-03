import { API } from "@/src/types/api";

type RequestMethod<O extends object> = (
  endpoint: Endpoint,
  body: O,
  path: string
) => Promise<Response>;

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function _urlPath(endpoint: Endpoint, path = "") {
  return `${endpoint}${path.length > 0 ? "/" : ""}${path}`;
}

async function _makeJSONRequest<O>(
  method: HTTPMethod,
  endpoint: Endpoint,
  body: O,
  path: string
): Promise<Response> {
  return fetch(`${_urlPath(endpoint, path)}`, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function _makeGETRequest<O extends object>(
  endpoint: Endpoint,
  query: O,
  path: string
): Promise<Response> {
  const requestUrl = `${_urlPath(endpoint, path)}?${VercelAPI.optionsToUrl({
    ...query,
  })}`;
  return fetch(requestUrl, {
    method: "GET",
  });
}

async function makeRequest<T, O extends object = object>(
  endpoint: Endpoint,
  body: O,
  path: string,
  method: HTTPMethod
): Promise<T | null>;
async function makeRequest<T, O extends object = object>(
  endpoint: Endpoint,
  body: O,
  path: string,
  method: HTTPMethod,
  defaultResponse: T
): Promise<T>;
async function makeRequest<T, O extends object = object>(
  endpoint: Endpoint,
  body: O,
  path = "",
  method: HTTPMethod,
  defaultResponse?: T
): Promise<T | null> {
  let requestMethod: RequestMethod<O>;

  switch (method) {
    case "GET": {
      requestMethod = _makeGETRequest;
      break;
    }
    default: {
      requestMethod = _makeJSONRequest.bind(null, method);
      break;
    }
  }

  const response = await requestMethod(endpoint, body, path);

  const baseUrlPath = _urlPath(endpoint, path);

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error(
      `Failed to make call to "${baseUrlPath}" because the user was logged out`
    );
  }

  const responseJson: object | string = await response.json();

  if (typeof responseJson === "string") {
    console.warn(responseJson);
    if (defaultResponse === undefined) {
      console.warn(`No default reponse provide for request "${baseUrlPath}"`);
      return null;
    }

    return defaultResponse;
  }

  return responseJson as T;
}

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

  makeRequest,

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
  DB = "/api/db",
  AWS = "/api/aws",
  UPLOAD = "/api/upload",
}
