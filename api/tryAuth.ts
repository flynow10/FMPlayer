import { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuthorization } from "./_checkAuth.mjs";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json(checkAuthorization(req));
}
