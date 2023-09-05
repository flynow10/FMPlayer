import { LambdaClient } from "@aws-sdk/client-lambda";
import { getEnvVar, getVercelEnvironment } from "./constants.js";
import { S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import Ably from "ably";

const IS_LOCAL = getVercelEnvironment() === "development";
export const prismaClient = new PrismaClient({
  errorFormat: IS_LOCAL ? "pretty" : "minimal",
});

const ABLY_ROOT_KEY = getEnvVar("ABLY_ROOT_KEY");

export const s3Client = new S3Client({});

export const lambdaClient = new LambdaClient({});

export const ablyRest = new Ably.Rest.Promise({ key: ABLY_ROOT_KEY });
