import type { VercelRequest, VercelResponse } from "@vercel/node";
import Ably from "ably";
import { AblyMessage } from "fm-player-shared";
import { ablyRest } from "../api-lib/data-clients.js";

async function getAblyToken(): Promise<Ably.Types.TokenRequest> {
  return ablyRest.auth.createTokenRequest({
    capability: {
      [AblyMessage.Channel.FileUpload]: ["subscribe"],
      [AblyMessage.Channel.DatabaseChanges]: ["subscribe"],
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json("Method not allowed! Send a GET request instead");
  }

  try {
    const token = await getAblyToken();
    res.status(200).json(token);
  } catch (e) {
    console.error(e);
    res.status(500).json(`Error requesting token: ${JSON.stringify(e)}`);
  }
}
