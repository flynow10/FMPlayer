import { handleRequest } from "../api-lib/api-utils.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setUserCookie } from "../api-lib/auth.js";

function checkAuthorization(hash: string): boolean {
  const correctHash = process.env.PASSWORD_HASH;

  if (!correctHash) {
    throw Error("Missing correct hash variable!");
  }

  return hash === correctHash;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestParams = handleRequest(req, res, {
    expectedBodyParams: ["hash"],
    allowedMethods: "POST",
  });

  if (requestParams === null) {
    return;
  }

  if (checkAuthorization(requestParams.body.hash as string)) {
    return (await setUserCookie(res)).status(200).json({ success: true });
  }

  return res.status(200).json({ success: false, error: "Invalid password" });
}
