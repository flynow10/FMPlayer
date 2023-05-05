import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  let jsonBody;
  try {
    jsonBody = JSON.parse(req.body);
  } catch (e) {
    return res.status(403).json("Bad JSON!");
  }
  return res.status(200).json(JSON.stringify(jsonBody));
}
