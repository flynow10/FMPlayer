import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setUserCookie } from "../api-lib/auth.js";

function checkAuthorization(request: VercelRequest): boolean {
  const hash = request.body.hash,
    correctHash = process.env.PASSWORD_HASH;

  if (!correctHash) {
    throw Error("Missing correct hash variable!");
  }

  if (!hash || typeof hash !== "string") {
    return false;
  }

  return hash === correctHash;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  if (checkAuthorization(req)) {
    return (await setUserCookie(res)).status(200).json({ success: true });
  }

  return res.status(200).json({ success: false, error: "Invalid password" });
}
