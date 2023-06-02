import { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnvVar } from "./_constants.js";

const S3_SONGS_BUCKET = getEnvVar("S3_SONGS_BUCKET");

const s3Client = new S3Client({});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  switch (req.query.type) {
    case "song-url": {
      const songId = (req.query.id as string) || "";
      if (songId === "") {
        res.status(400).json({ error: "Missing song ID!" });
        return;
      }
      res.status(200).json({ url: await getSongUrl(songId) });
      break;
    }
    default: {
      res.status(400).send("Invalid type");
      return;
    }
  }
}

async function getSongUrl(songId: string) {
  const command = new GetObjectCommand({
    Bucket: S3_SONGS_BUCKET,
    Key: getS3SongKey(songId),
  });
  return await getSignedUrl(s3Client, command);
}

function getS3SongKey(songId: string) {
  return songId + ".ogg";
}
