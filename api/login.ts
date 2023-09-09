import { handleRequest } from "../api-lib/api-utils.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setUserCookie } from "../api-lib/auth.js";
import { getEnvVar } from "../api-lib/constants.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestParams = handleRequest(req, res, {
    expectedBodyParams: ["hash"],
    allowedMethods: "POST",
  });
  const correctHash = getEnvVar("PASSWORD_HASH");

  if (requestParams === null) {
    return;
  }

  if (requestParams.body.hash === correctHash) {
    return (await setUserCookie(res)).status(200).json({ success: true });
  }

  return res.status(200).json({ success: false, error: "Invalid password" });
}
