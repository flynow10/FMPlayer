import { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { checkAuthorization } from "./_checkAuth.mjs";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkAuthorization(req)) {
    return res.status(401).json("Failed to authenticate request");
  }
  const { S3_BUCKET_NAME, AWS_KEY, AWS_SECRET } = process.env;
  if (!S3_BUCKET_NAME || !AWS_KEY || !AWS_SECRET) {
    console.log(S3_BUCKET_NAME);
    console.log(AWS_KEY);
    console.log(AWS_SECRET);
    return res.status(403).json("Missing an environment variable!");
  }
  const fileKey = req.query.file;
  if (!fileKey || typeof fileKey !== "string") {
    return res.status(403).json("Missing file name!");
  }
  const client = new S3Client({
    credentials: {
      accessKeyId: AWS_KEY,
      secretAccessKey: AWS_SECRET,
    },
    region: "us-east-2",
  });

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
  });
  const url = await getSignedUrl(client, command);
  console.log(url);
  return res.status(200).json({ url });
}
