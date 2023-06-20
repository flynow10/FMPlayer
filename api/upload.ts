import { v4 as uuid } from "uuid";
import { printRequestType } from "../api-lib/_api-utils.js";
import { getEnvVar } from "../api-lib/_constants.js";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prismaClient, s3Client } from "../api-lib/_data-clients.js";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import type { UploadFileBody } from "../api-lib/_upload-types.js";

const S3_SONG_CONVERSION_BUCKET = getEnvVar("S3_SONG_CONVERSION_BUCKET");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json("Method not allowed");
    return;
  }

  if (typeof req.query.type !== "string" || req.query.type === "") {
    res.status(400).json("Missing type");
    return;
  }

  printRequestType("upload", req.query.type);

  switch (req.query.type) {
    case "upload-file":
      if (req.body.file === undefined) {
        res.status(400).json("Missing file");
        return;
      }
      if (req.body.metadata === undefined) {
        res.status(400).json("Missing metadata");
        return;
      }
      const { file, metadata }: UploadFileBody = req.body;
      if (file.ext.match(/^([0-9A-z]{1,4})$/) === null) {
        res.status(400).json("Invalid file type");
        return;
      }
      const id = uuid();
      if (metadata.title === undefined) {
        metadata.title = `Untitled ${id.substring(0, 8)}`;
      }
      if (typeof metadata.artists === "string") {
        metadata.artists = [metadata.artists];
      }
      if (typeof metadata.featuring === "string") {
        metadata.featuring = [metadata.featuring];
      }
      const song = await prismaClient.song.create({
        data: {
          id: id,
          title: metadata.title,
          genre: metadata.genre,
          artists: metadata.artists,
          featuring: metadata.featuring,
          albumId: metadata.albumId,
          trackNumber: metadata.trackNumber,
        },
      });

      const key = `${id}.${file.ext}`;

      const post = await createPresignedPost(s3Client, {
        Bucket: S3_SONG_CONVERSION_BUCKET,
        Key: key,
      });
      res.status(200).json({ id, song, post });
      return;
    case "conversion-complete": {
      const { id } = req.body;
      if (typeof id !== "string" || id === "") {
        res.status(400).json("Missing id");
        return;
      }
      const song = await prismaClient.song.update({
        where: {
          id,
        },
        data: {
          audioUploaded: new Date(),
        },
      });
      res.status(200).json(song);
      return;
    }
    default:
      res.status(400).json("Invalid type");
  }
}
