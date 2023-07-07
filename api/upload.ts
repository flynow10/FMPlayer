import { printRequestType } from "../api-lib/api-utils.js";
import { getEnvVar } from "../api-lib/constants.js";
import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  lambdaClient,
  prismaClient,
  s3Client,
} from "../api-lib/data-clients.js";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { PostgresRequest } from "@/src/types/postgres-request.js";
import { Prisma } from "@prisma/client";
import { Music } from "@/src/types/music.js";
import { InvokeCommand } from "@aws-sdk/client-lambda";

const S3_SONG_CONVERSION_BUCKET = getEnvVar("S3_SONG_CONVERSION_BUCKET");
const LAMBDA_YOUTUBE_DOWNLOAD_FUNCTION = getEnvVar(
  "LAMBDA_YOUTUBE_DOWNLOAD_FUNCTION"
);

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
    case "downloadYoutubeVideo": {
      if (req.body.video === undefined) {
        res.status(400).json("Missing file");
        return;
      }

      if (req.body.metadata === undefined) {
        res.status(400).json("Missing metadata");
        return;
      }

      const { video, metadata }: PostgresRequest.DownloadYoutubeVideoBody =
        req.body;

      if (
        typeof video.id !== "string" ||
        video.id.length !== 11 ||
        video.id.match(/^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/) === null
      ) {
        res.status(400).json("Invalid video id");
        return;
      }

      const song = await updateDbWithMetadata(metadata);

      const command = new InvokeCommand({
        FunctionName: LAMBDA_YOUTUBE_DOWNLOAD_FUNCTION,
        InvocationType: "Event",
        Payload: JSON.stringify({
          fileId: metadata.id,
          videoId: video.id,
        }),
      });
      const output = await lambdaClient.send(command);

      res.status(200).json({ song, output });
      return;
    }
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

      const song = await updateDbWithMetadata(metadata);

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

async function updateDbWithMetadata(metadata: Music.Files.EditableMetadata) {
  let album: Prisma.AlbumCreateNestedOneWithoutSongsInput | undefined =
    undefined;

  if (metadata.albumId !== undefined && metadata.albumId !== null) {
    album = {
      connect: {
        id: metadata.albumId,
      },
    };
  }

  return await prismaClient.song.create({
    data: {
      id: metadata.id,
      title: metadata.title,
      genre: metadata.genre,
      artists: {
        connectOrCreate: metadata.artists.map((a) => {
          return {
            create: {
              name: a,
            },
            where: {
              name: a,
            },
          };
        }),
      },
      featuring: {
        connectOrCreate: metadata.featuring.map((a) => {
          return {
            create: {
              name: a,
            },
            where: {
              name: a,
            },
          };
        }),
      },
      album,
      trackNumber: metadata.trackNumber,
    },
  });
}
