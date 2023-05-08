import { VercelRequest, VercelResponse } from "@vercel/node";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
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
  const fileName = req.query.file,
    fileType = req.query.fileType;
  if (!fileName || typeof fileName !== "string") {
    return res.status(403).json("Missing file name!");
  }
  if (!fileType || typeof fileType !== "string") {
    return res.status(403).json("Missing file type!");
  }
  const client = new S3Client({
    credentials: {
      accessKeyId: AWS_KEY,
      secretAccessKey: AWS_SECRET,
    },
    region: "us-east-2",
  });
  const post = await createPresignedPost(client, {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Fields: {
      "Content-Type": fileType,
    },
  });
  return res.status(200).json(post);
}
