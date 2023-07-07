import { LambdaClient } from "@aws-sdk/client-lambda";
import { getVercelEnvironment } from "./constants.js";
import { S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const IS_LOCAL = getVercelEnvironment() === "development";
export const prismaClient = new PrismaClient({
  errorFormat: IS_LOCAL ? "pretty" : "minimal",
});

export const s3Client = new S3Client({});

export const lambdaClient = new LambdaClient({});
