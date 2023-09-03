import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEnvVar } from "../api-lib/constants.js";
import Ably from "ably";
import { handleRequest } from "../api-lib/api-utils.js";

const ABLY_ROOT_KEY = getEnvVar("ABLY_ROOT_KEY");

const rest = new Ably.Rest({ key: ABLY_ROOT_KEY });

async function getAblyToken(): Promise<Ably.Types.TokenRequest> {
  return new Promise((resolve, reject) => {
    rest.auth.createTokenRequest(
      {
        capability: {
          ["file-upload"]: ["subscribe"],
        },
      },
      (err, tokenRequest) => {
        if (err || !tokenRequest) {
          reject(err);
        } else {
          resolve(tokenRequest);
        }
      }
    );
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const request = handleRequest(req, res, {
    allowedMethods: "GET",
  });
  if (request === null) {
    return;
  }

  try {
    const token = await getAblyToken();
    res.status(200).json(token);
  } catch (e) {
    console.error(e);
    res.status(500).json(`Error requesting token: ${JSON.stringify(e)}`);
  }
}
