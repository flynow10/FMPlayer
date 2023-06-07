import { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnvVar, getVercelEnvironment } from "../lib/_constants.js";

const IS_LOCAL = getVercelEnvironment() === "development";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json("Method not allowed");
    return;
  }

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

const s3Client = new S3Client({});

const urlCache = new Map<string, { time: number; url: string }>();
const expirationTimeS = 60 * 60 * 12; // 12 hours
const expirationTimeMS = expirationTimeS * 1000;

const maxTimeMarginS = 60 * 60; // 1 hour
const maxTimeMarginMS = maxTimeMarginS * 1000;

async function getSongUrl(songId: string) {
  if (urlCache.has(songId)) {
    const { time, url } = urlCache.get(songId)!;
    if (time > Date.now() + maxTimeMarginMS) {
      return url;
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