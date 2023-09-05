import { VercelRequest, VercelResponse } from "@vercel/node";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnvVar, getVercelEnvironment } from "../api-lib/constants.js";
import { handleRequest, printRequestType } from "../api-lib/api-utils.js";
import { lambdaClient, s3Client } from "../api-lib/data-clients.js";
import { InvokeCommand } from "@aws-sdk/client-lambda";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const IS_LOCAL = getVercelEnvironment() === "development";

const S3_SONG_CONVERSION_BUCKET = getEnvVar("S3_SONG_CONVERSION_BUCKET");
const LAMBDA_YOUTUBE_DOWNLOAD_FUNCTION = getEnvVar(
  "LAMBDA_YOUTUBE_DOWNLOAD_FUNCTION"
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestParams = handleRequest(req, res, {
    expectsPath: ["song-url", "s3-post", "download-video"],
  });
  if (requestParams === null) return;

  const { path } = requestParams;

  printRequestType("aws", path);

  switch (path) {
    case "song-url": {
      const queryParams = handleRequest(req, res, {
        allowedMethods: "GET",
        expectedBodyParams: ["trackId"],
      });
      if (queryParams === null) break;

      const { trackId: id } = queryParams.body;
      if (typeof id !== "string") {
        res
          .status(400)
          .json(`Expected trackId to be a string, but it was '${typeof id}'`);
        return;
      }

      if (IS_LOCAL) {
        res.status(200).json({ url: `/static/songs/${id}.ogg` });
        return;
      }

      res.status(200).json({ url: await getSongUrl(id) });
      return;
    }
    case "s3-post": {
      const bodyParams = handleRequest(req, res, {
        allowedMethods: "POST",
        expectedBodyParams: ["fileExt", "fileId"],
      });

      if (bodyParams === null) return;

      const { fileExt, fileId } = bodyParams.body as {
        fileExt: string;
        fileId: string;
      };

      if (fileExt.match(/^([0-9A-z]{1,4})$/) === null) {
        res.status(400).json("Invalid file type");
        return;
      }

      if (IS_LOCAL) {
        res
          .status(500)
          .json("Unable connect to AWS in development environment!");
        return;
      }

      const key = `${fileId}.${fileExt}`;

      const post = await createPresignedPost(s3Client, {
        Bucket: S3_SONG_CONVERSION_BUCKET,
        Key: key,
      });

      res.status(200).json(post);
      return;
    }
    case "download-video": {
      const bodyParams = handleRequest(req, res, {
        allowedMethods: "POST",
        expectedBodyParams: ["videoId", "trackId"],
      });

      if (bodyParams === null) return;

      const { videoId, trackId } = bodyParams.body;

      if (
        typeof videoId !== "string" ||
        videoId.length !== 11 ||
        videoId.match(/^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/) === null
      ) {
        res.status(400).json("Invalid videoId");
        return;
      }

      if (IS_LOCAL) {
        res
          .status(500)
          .json("Unable connect to AWS in development environment!");
        return;
      }

      const command = new InvokeCommand({
        FunctionName: LAMBDA_YOUTUBE_DOWNLOAD_FUNCTION,
        InvocationType: "Event",
        Payload: JSON.stringify({
          fileId: trackId,
          videoId: videoId,
        }),
      });
      const output = await lambdaClient.send(command);
      console.log(output);

      res.status(200).json(output.StatusCode === 200);
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
