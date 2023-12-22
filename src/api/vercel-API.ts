import { getApplicationDebugConfig } from "@/config/app";

import objectHash from "object-hash";

const REFRESH_TOKEN_ID = "refresh-token";
type RequestMethod<O extends object> = (
  endpoint: Endpoint,
  body: O,
  path: string
) => Promise<object | string | LoggedOutUserError>;

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

class LoggedOutUserError extends Error {
  constructor() {
    super();
  }
}

function _urlPath(endpoint: Endpoint, path = "") {
  return `${endpoint}${path.length > 0 ? "/" : ""}${path}`;
}

const requestPromises: Record<
  string,
  Promise<object | string | LoggedOutUserError>
> = {};

async function _makeJSONRequest<O>(
  method: HTTPMethod,
  endpoint: Endpoint,
  body: O,
  path: string
): Promise<object | string | LoggedOutUserError> {
  const idempotencyToken = objectHash({ method, endpoint, path, body });
  if (idempotencyToken in requestPromises) {
    return requestPromises[idempotencyToken];
  }
  const responsePromise = fetch(
    `${_urlPath(endpoint, path)}?method=${method}`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((response) => {
    if (response.status === 401) {
      return new LoggedOutUserError();
    }
    return response.json();
  });
  requestPromises[idempotencyToken] = responsePromise;
  const response = await responsePromise;
  delete requestPromises[idempotencyToken];
  return response;
}

/* Unused code from before switch to query parameter method specification */

// DO NOT REMOVE!
// May find a work around that allows use of this code again

// function optionsToUrl(options: object): string {
//   const urlSearchParams = new URLSearchParams(
//     Object.entries(options).reduce((obj, val) => {
//       if (typeof val[1] === "number") {
//         obj[val[0]] = val[1].toString(10);
//       } else if (!Array.isArray(val[1])) {
//         obj[val[0]] = val[1];
//       }

//       return obj;
//     }, {} as Record<string, string>)
//   );
//   Object.entries(options).forEach(([key, value]) => {
//     if (Array.isArray(value)) {
//       value.forEach((v) => urlSearchParams.append(key, v));
//     }
//   });
//   return urlSearchParams.toString();
// }

// async function _makeGETRequest<O extends object>(
//   endpoint: Endpoint,
//   query: O,
//   path: string
// ): Promise<Response> {
//   const requestUrl = `${_urlPath(endpoint, path)}?${VercelAPI.optionsToUrl({
//     ...query,
//   })}`;
//   return fetch(requestUrl, {
//     method: "GET",
//   });
// }

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
    // case "GET": {
    //   requestMethod = _makeGETRequest;
    //   break;
    // }
    default: {
      requestMethod = _makeJSONRequest.bind(null, method);
      break;
    }
  }

  const response = await requestMethod(endpoint, body, path);

  const baseUrlPath = _urlPath(endpoint, path);

  if (response instanceof LoggedOutUserError) {
    if (await refreshToken()) {
      if (defaultResponse === undefined) {
        return makeRequest(endpoint, body, path, method);
      } else {
        return makeRequest(endpoint, body, path, method, defaultResponse);
      }
    } else {
      window.location.href = "/login";
      throw new Error(
        `Failed to make call to "${baseUrlPath}" because the user was logged out`
      );
    }
  }

  const responseJson: object | string = response;

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

async function refreshToken() {
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_ID);
  if (!refreshToken) {
    return false;
  }
  return (await sendTokenRequest("refresh", refreshToken)).success;
}

async function sendTokenRequest(type: "login" | "refresh", body: string) {
  try {
    const response = await fetch(`/api/token/${type}`, {
      method: "POST",
      body: JSON.stringify({
        [type === "login" ? "pHash" : "refreshToken"]: body,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseJson = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseJson,
      };
    }

    window.localStorage.setItem(REFRESH_TOKEN_ID, responseJson.refreshToken);

    return {
      success: true,
      error: null,
    };
  } catch (e) {
    return {
      success: false,
      error: e,
    };
  }
}

export const VercelAPI = {
  isLoggedIn: async () => {
    const config = getApplicationDebugConfig();
    if (config !== null && !config.useLogin) {
      return true;
    }
    try {
      return await refreshToken();
    } catch (e) {
      console.error(e);
    }

    return false;
  },

  loginWithPassword: async (password: string) => {
    const utf8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return await sendTokenRequest("login", hashHex);
  },

  makeRequest,
};

export enum Endpoint {
  DB = "/api/db",
  AWS = "/api/aws",
}
