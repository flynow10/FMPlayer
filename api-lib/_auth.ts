import { nanoid } from "nanoid";
import { SignJWT, jwtVerify } from "jose";
import {
  USER_TOKEN,
  getJwtSecretKey,
  getVercelEnvironment,
} from "./_constants.js";
import cookie from "cookie";
import { VercelResponse } from "@vercel/node";

interface UserJwtPayload {
  jti: string;
  iat: number;
}

class AuthError extends Error {}

export async function verifyAuth(req: Request) {
  // Get token from cookie
  const cookies = req.headers.get("cookie");
  const parsedCookies = cookie.parse(cookies || "");
  const token = parsedCookies[USER_TOKEN];

  if (!token) throw new AuthError("Missing user token");

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload as UserJwtPayload;
  } catch (err) {
    throw new AuthError("Your token has expired.");
  }
}

/**
 * Adds the user token cookie to a response.
 */

export async function setUserCookie(res: VercelResponse) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  res.setHeader(
    "Set-Cookie",
    cookie.serialize(USER_TOKEN, token, {
      secure: true,
      path: "/",
      httpOnly: getVercelEnvironment() !== "development",
      maxAge: 60 * 60 * 2,
    })
  );

  return res;
}

/**
 * Expires the user token cookie
 */

export function expireUserCookie(res: VercelResponse) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(USER_TOKEN, "", {
      httpOnly: true,
      maxAge: 0,
    })
  );
  return res;
}
