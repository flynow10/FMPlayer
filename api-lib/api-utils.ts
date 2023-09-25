import { VercelRequest, VercelResponse } from "@vercel/node";

export const printRequestType = (endpoint: string, type: string) => {
  console.log(`[serverless][${endpoint}]: Received "${type}" request`);
};

type Paramters<Keys extends string, ValueType = string> = {
  [key in Keys]: ValueType;
};

export const expectParameters = <P extends string, ValueType = string>(
  rawParamsObject: unknown,
  res: VercelResponse,
  expectedParamters: P[],
  objectName = "body"
): Paramters<P, ValueType> | null => {
  const params: Partial<Paramters<P, ValueType>> = {};
  if (expectedParamters.length === 0) {
    return {} as Paramters<P, ValueType>;
  }

  if (!(rawParamsObject && typeof rawParamsObject === "object")) {
    res.status(400).json(`Request is missing it's ${objectName} parameters!`);
    return null;
  } else {
    for (const key of expectedParamters) {
      if (key in rawParamsObject) {
        params[key as P] = (rawParamsObject as Record<P, ValueType>)[
          key
        ] as ValueType;
      } else {
        res
          .status(400)
          .json(`Request is missing ${objectName} paramter: '${key}'`);
        return null;
      }
    }
  }
  return params as Paramters<P, ValueType>;
};

export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type RequestOptions<
  Query extends string,
  Body extends string,
  Path extends string | null = null,
  HasPath extends boolean = true
> = {
  expectsPath: Exclude<Path, null>[] | HasPath;
  expectedQueryParams: Query[];
  expectedBodyParams: Body[];
  allowedMethods: Method | Method[];
};

type RequestParams<
  Query extends string,
  Body extends string,
  Path extends string | null = null,
  HasPath extends boolean = false
> = {
  query: Paramters<Query>;
  body: Paramters<Body, unknown>;
  method: Method;
} & (HasPath extends false
  ? Path extends null
    ? object
    : { path: Path }
  : { path: Exclude<Path, null> });

const defaultOptions: RequestOptions<string, string, string, false> = {
  expectsPath: false,
  allowedMethods: ["GET", "DELETE", "PATCH", "POST", "PUT"],
  expectedBodyParams: [],
  expectedQueryParams: [],
};

export const handleRequest = <
  Query extends string,
  Body extends string,
  Path extends string | null,
  HasPath extends boolean
>(
  req: VercelRequest,
  res: VercelResponse,
  options?: Partial<RequestOptions<Query, Body, Path, HasPath>>
): RequestParams<Query, Body, Path, HasPath> | null => {
  const opts: RequestOptions<Query, Body, Path, HasPath> = Object.assign(
    {},
    defaultOptions,
    options ?? {}
  );

  const parsedAllowedMethods: Method[] =
    typeof opts.allowedMethods === "string"
      ? [opts.allowedMethods]
      : opts.allowedMethods;
  if (req.method !== "POST") {
    res
      .status(405)
      .json(
        `Vercel dev server currently has a bug making http methods not work correctly. Please send a POST request with the http method included as a query parameter.`
      );
    return null;
  }

  let queryMethod = req.query.method as Method;
  if (!(req.query.method && typeof req.query.method === "string")) {
    queryMethod = "POST";
  }

  if (!parsedAllowedMethods.includes(queryMethod)) {
    res
      .status(405)
      .json(
        `Method not allowed! Allowed methods include ${parsedAllowedMethods.join(
          ", "
        )}. Vercel dev server currently has a bug making http methods not work correctly. Please send a POST request with the http method included as a query parameter.`
      );
    return null;
  }

  const pathAddon: Partial<{ path: Path }> = {};
  if (opts.expectsPath) {
    const path = req.query["path"] as Exclude<Path, null>;
    if (!(path && typeof path === "string")) {
      res.status(400).json("Expected path at end of url, but it was missing!");
      return null;
    } else {
      if (Array.isArray(opts.expectsPath)) {
        if (!opts.expectsPath.includes(path)) {
          res.status(400).json("Requested path does not exist!");
          return null;
        }
      }
      pathAddon.path = path;
    }
  }

  const bodyParams: Paramters<Body, unknown> | null = expectParameters(
    req.body,
    res,
    opts.expectedBodyParams,
    "body"
  );
  if (bodyParams === null) {
    return null;
  }

  const queryParams: Paramters<Query> | null = expectParameters(
    req.query,
    res,
    opts.expectedQueryParams,
    "query"
  );
  if (queryParams === null) {
    return null;
  }

  return {
    body: bodyParams,
    query: queryParams,
    method: queryMethod,
    ...(pathAddon as HasPath extends false
      ? Path extends null
        ? object
        : { path: Path }
      : { path: Exclude<Path, null> }),
  };
};

/**
 * Adds time to a date. Modelled after MySQL DATE_ADD function.
 * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
 * https://stackoverflow.com/a/1214753/18511
 *
 * @param date  Date to start with
 * @param interval  One of: year, quarter, month, week, day, hour, minute, second
 * @param units  Number of units of the given interval to add.
 */
export function dateAdd(
  date: Date,
  interval:
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second",
  units: number
) {
  if (!(date instanceof Date)) return undefined;
  const ret = new Date(date); //don't change original date
  const checkRollover = function () {
    if (ret.getDate() != date.getDate()) ret.setDate(0);
  };
  switch (interval) {
    case "year":
      ret.setFullYear(ret.getFullYear() + units);
      checkRollover();
      break;
    case "quarter":
      ret.setMonth(ret.getMonth() + 3 * units);
      checkRollover();
      break;
    case "month":
      ret.setMonth(ret.getMonth() + units);
      checkRollover();
      break;
    case "week":
      ret.setDate(ret.getDate() + 7 * units);
      break;
    case "day":
      ret.setDate(ret.getDate() + units);
      break;
    case "hour":
      ret.setTime(ret.getTime() + units * 3600000);
      break;
    case "minute":
      ret.setTime(ret.getTime() + units * 60000);
      break;
    case "second":
      ret.setTime(ret.getTime() + units * 1000);
      break;
  }
  return ret;
}
