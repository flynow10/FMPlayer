import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEnvVar } from "../api-lib/constants.js";
import Ably from "ably";

const ABLY_ROOT_KEY = getEnvVar("ABLY_ROOT_KEY");

const rest = new Ably.Rest({ key: ABLY_ROOT_KEY });

async function getAblyToken(): Promise<Ably.Types.TokenRequest> {
  return new Promise((resolve, reject) => {
    rest.auth.createTokenRequest(
      {
        capability: {
          "upload-status": ["subscribe"],
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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = await getAblyToken();
    res.status(200).json(token);
  } catch (e) {
    console.error(e);
    res.status(500).json(`Error requesting token: ${JSON.stringify(e)}`);
  }
}
