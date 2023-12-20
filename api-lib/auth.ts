import { VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { dateAdd } from "./api-utils.js";
import {
  getEnvVar,
  getJwtSecretKey,
  REFRESH_TOKEN_EXPIRATION,
} from "./constants.js";
import { prismaClient } from "./data-clients.js";

export class AuthError extends Error {}

function hashString(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function authenticateUser(passwordHash: string) {
  const correctHash = getEnvVar("PASSWORD_HASH");
  if (passwordHash !== correctHash) {
    throw new AuthError("Incorrect Password");
  }
  return createTokenPair();
}

export async function refreshSession(refreshToken: string) {
  const refreshHash = hashString(refreshToken);
  try {
    await prismaClient.session.findUniqueOrThrow({
      where: {
        refreshToken: refreshHash,
        expiresOn: {
          gte: new Date(),
        },
      },
    });
  } catch (e) {
    throw new AuthError("Invalid refresh token");
  }
  return createTokenPair();
}

async function createTokenPair() {
  const jwtSecret = getJwtSecretKey();
  const textEncoder = new TextEncoder();

  const refreshToken = crypto.randomBytes(64).toString("hex");
  const refreshHash = hashString(refreshToken);
  const refreshExpiration = dateAdd(
    new Date(),
    "minute",
    REFRESH_TOKEN_EXPIRATION
  );
  if (refreshExpiration === undefined) {
    throw new Error("Failed to create refresh expiration date!");
  }
  try {
    const dbReturnedToken = await prismaClient.session.create({
      data: {
        refreshToken: refreshHash,
        expiresOn: refreshExpiration,
      },
    });
    if (dbReturnedToken.refreshToken !== refreshHash) {
      throw new Error("Database token does not match generated hash!");
    }
  } catch (e) {
    throw new Error("Failed to save session to database", { cause: e });
  }

  const accessToken = await new SignJWT({})
    .setExpirationTime("15m")
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setJti(nanoid())
    .sign(textEncoder.encode(jwtSecret));

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Adds the user token cookie to a response.
 */

export function setCookie(res: VercelResponse, cookieString: string) {
  res.setHeader("Set-Cookie", cookieString);
  return res;
}
