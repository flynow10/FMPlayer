import { getEnvVar, getVercelEnvironment } from "./constants.js";
import { S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const IS_LOCAL = getVercelEnvironment() === "development";

const prismaDatasource =
  getVercelEnvironment() === "development"
    ? getEnvVar("DEVELOPMENT_DB_URL")
    : getEnvVar("SUPABASE_DATABASE_URL");
export const prismaClient = new PrismaClient({
  datasources: { db: { url: prismaDatasource } },
  errorFormat: IS_LOCAL ? "pretty" : "minimal",
});

export const s3Client = new S3Client({});
