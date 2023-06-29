import { printRequestType } from "../api-lib/api-utils.js";
import { getEnvVar } from "../api-lib/constants.js";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { prismaClient, s3Client } from "../api-lib/data-clients.js";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { PostgresRequest } from "@/src/types/postgres-request.js";
import { Prisma } from "@prisma/client";

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
    case "uploadFile": {
      if (req.body.file === undefined) {
        res.status(400).json("Missing file");
        return;
      }

      if (req.body.metadata === undefined) {
        res.status(400).json("Missing metadata");
        return;
      }

      const { file, metadata }: PostgresRequest.UploadFileBody = req.body;

      if (file.ext.match(/^([0-9A-z]{1,4})$/) === null) {
        res.status(400).json("Invalid file type");
        return;
      }

      let album: Prisma.AlbumCreateNestedOneWithoutSongsInput | undefined =
        undefined;

      if (metadata.albumId !== undefined && metadata.albumId !== null) {
        album = {
          connect: {
            id: metadata.albumId,
          },
        };
      }

      const song = await prismaClient.song.create({
        data: {
          id: metadata.id,
          title: metadata.title,
          genre: metadata.genre,
          artists: metadata.artists,
          featuring: metadata.featuring,
          album,
          trackNumber: metadata.trackNumber,
        },
      });

      const key = `${metadata.id}.${file.ext}`;

      const post = await createPresignedPost(s3Client, {
        Bucket: S3_SONG_CONVERSION_BUCKET,
        Key: key,
      });
      res.status(200).json({ song, post });
      return;
    }

    case "conversionComplete": {
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
