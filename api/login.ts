import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setUserCookie } from "./_auth.js";

function checkAuthorization(request: VercelRequest): boolean {
  const hash = request.query.p,
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
  if (checkAuthorization(req)) {
    return (await setUserCookie(res)).status(200).json({ success: true });
  }
  return res.status(200).json({ success: false });
}
