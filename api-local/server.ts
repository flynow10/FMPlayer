import type { Handler, Request } from "vite-api-server";
import verceljson from "../vercel.local.json";
import { VercelApiHandler, VercelRequest, VercelResponse } from "@vercel/node";
import { readdirSync } from "fs";
import path from "path";
import https from "https";

const APIHandlersPath = path.resolve(process.cwd(), "./api/");

export const handler: Handler = async (req: Request, res, next) => {
  try {
    const vercelRequest = Object.assign(req, {
      cookies: {},
    }) as VercelRequest;
    const vercelResponse: VercelResponse = Object.assign(res, {
      json: (json: unknown) => {
        res.end(JSON.stringify(json), "utf-8");
        return vercelResponse;
      },
      send: (body: unknown) => {
        res.end(body);
        return vercelResponse;
      },
      redirect: (statusOrUrl: string | number, url?: string) => {
        if (typeof statusOrUrl === "number" && url !== undefined) {
          res
            .writeHead(statusOrUrl, {
              Location: url,
            })
            .end();
        } else if (typeof statusOrUrl === "string") {
          res
            .writeHead(307, {
              Location: statusOrUrl,
            })
            .end();
        } else {
          throw new Error();
        }
        return vercelResponse;
      },
      status: (statusCode: number) => {
        res.statusCode = statusCode;
        return vercelResponse;
      },
    });

    // Url Rewrites
    const rewriteRules = verceljson.rewrites;

    let requestPath = req.path;
    let isProxy = false;

    if (requestPath.endsWith("/")) {
      requestPath = requestPath.substring(0, requestPath.length - 1);
    }

    for (let i = 0; i < rewriteRules.length; i++) {
      const rule = rewriteRules[i];
      const sourceMatchRegex = new RegExp(
        rule.source
          .replace(/:([A-z]+)\*?/g, (_, pathName) => `(?<${pathName}>.+)`)
          .replace(/\//g, "\\/")
      );
      const sourceMatch = sourceMatchRegex.exec(requestPath);
      if (sourceMatch !== null) {
        requestPath = rule.destination;

        if (rule.source.startsWith("/proxy")) {
          isProxy = true;
        }

        if (sourceMatch.groups) {
          const matchGroups = Object.entries(sourceMatch.groups);
          matchGroups.forEach(([groupName, value]) => {
            if (!isProxy) {
              vercelRequest.query[groupName] = value;
            }
            requestPath = requestPath.replace(
              new RegExp(`:${groupName}\\*?`),
              value
            );
          });
        }

        break;
      }
    }

    if (isProxy) {
      const proxiedUrl = new URL(requestPath);
      Object.entries(vercelRequest.query).forEach(([key, value]) => {
        proxiedUrl.searchParams.append(
          key,
          typeof value === "string" ? value : value.join(",")
        );
      });

      return new Promise((resolve) =>
        https
          .request(
            proxiedUrl,
            {
              method: req.method,
            },
            (response) => {
              response.pipe(res);
              response.on("end", () => {
                res.end();
                resolve(res);
              });
            }
          )
          .on("error", (e) => {
            console.error(e);
            vercelResponse
              .status(500)
              .send("Internal Server Error! Proxy is currently not working.");
          })
          .end()
      );
    }

    const handlerFileNames = readdirSync(APIHandlersPath, {
      recursive: false,
    }).filter((item) => {
      return typeof item === "string" && item.match(/^(?:[._])/) === null;
    }) as string[];

    const handlePaths = handlerFileNames.map(
      (file) => `/api/${file.replace(/\.[A-z0-9]*$/, "")}`
    );

    for (let i = 0; i < handlePaths.length; i++) {
      const handlePath = handlePaths[i];
      const handlerFile = handlerFileNames[i];
      if (handlePath === requestPath) {
        const handlerModule = (
          await import(
            /* @vite-ignore */ path.resolve(APIHandlersPath, handlerFile)
          )
        ).default as VercelApiHandler;
        handlerModule(vercelRequest, vercelResponse);
        return vercelResponse;
      }
    }
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error! Failed to access api route.");
    } else {
      throw new Error(
        "Catastrophic failure! Headers were already sent when this error occured"
      );
    }
    return;
  }
  next();
};
