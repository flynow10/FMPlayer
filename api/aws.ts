import { VercelRequest, VercelResponse } from "@vercel/node";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnvVar, getVercelEnvironment } from "../api-lib/constants.js";
import { printRequestType } from "../api-lib/api-utils.js";
import { s3Client } from "../api-lib/data-clients.js";

const IS_LOCAL = getVercelEnvironment() === "development";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json("Method not allowed");
    return;
  }

  if (typeof req.query.type !== "string" || req.query.type === "") {
    res.status(400).json("Missing type");
    return;
  }

  printRequestType("aws", req.query.type);

  switch (req.query.type) {
    case "songUrl": {
      const { id } = req.query;

      if (IS_LOCAL) {
        res.status(200).json({ url: `/static/songs/${id}.ogg` });
        return;
      }

      if (typeof id !== "string" || id === "") {
        res.status(400).json("Missing song ID!");
        return;
      }

      res.status(200).json({ url: await getSongUrl(id) });
      break;
    }

    default: {
      res.status(400).json("Invalid type");
      return;
    }
  }
}

const S3_SONGS_BUCKET = getEnvVar("S3_SONGS_BUCKET");

const urlCache = new Map<string, { time: number; url: string }>();
const expirationTimeS = 60 * 60 * 3; // 3 hours
const expirationTimeMS = expirationTimeS * 1000;

const maxTimeMarginS = 60 * 60; // 1 hour
const maxTimeMarginMS = maxTimeMarginS * 1000;

async function getSongUrl(songId: string) {
  if (urlCache.has(songId)) {
    const cacheGet = urlCache.get(songId);

    if (cacheGet) {
      const { time, url } = cacheGet;

      if (time > Date.now() + maxTimeMarginMS) {
        return url;
      }
    }
  }

  const command = new GetObjectCommand({
    Bucket: S3_SONGS_BUCKET,
    Key: getS3SongKey(songId),
  });
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: expirationTimeS,
  });
  urlCache.set(songId, { time: Date.now() + expirationTimeMS, url });

  return url;
}

function getS3SongKey(songId: string) {
  return songId + ".ogg";
}
