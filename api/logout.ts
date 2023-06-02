import type { VercelRequest, VercelResponse } from "@vercel/node";
import { expireUserCookie } from "./_auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return (await expireUserCookie(res)).json({ success: true });
}
