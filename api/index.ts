import { VercelRequest } from "@vercel/node";

export const config = {
  runtime: "edge", // this is a pre-requisite
};

export default async function handler(req: VercelRequest) {
  console.log("Received Request");
  console.time("Request");
  const proxyUrl = "https://suggestqueries.google.com",
    cleanProxyUrl = proxyUrl.replace(/\/$/, "");
  const fetchUrl = cleanProxyUrl + req.url?.replace(/.+?api/, "");
  const fetchResponse = await fetch(fetchUrl);
  console.timeEnd("Request");
  return fetchResponse;
}
