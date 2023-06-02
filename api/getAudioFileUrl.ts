import { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const S3_SONGS_BUCKET = process.env.S3_SONGS_BUCKET;
  if (S3_SONGS_BUCKET === undefined) {
    return res.status(500).json("S3_SONGS_BUCKET not set!");
  }

  const songId = req.query.file;
  if (!songId || typeof songId !== "string") {
    return res.status(403).json("Missing file name!");
  }

  const client = new S3Client({});

  const command = new GetObjectCommand({
    Bucket: S3_SONGS_BUCKET,
    Key: songId + ".ogg",
  });
  try {
    const url = await getSignedUrl(client, command);
    return res.status(200).json(url);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
}
