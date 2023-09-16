import { expectParameters, handleRequest } from "../api-lib/api-utils";
import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  authenticateUser,
  AuthError,
  refreshSession,
  setCookie,
} from "../api-lib/auth";
import cookie from "cookie";
import { USER_TOKEN } from "../api-lib/constants";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestParams = handleRequest(req, res, {
    allowedMethods: "POST",
    expectsPath: ["login", "refresh"],
  });
  if (requestParams === null) {
    return;
  }

  switch (requestParams.path) {
    case "login": {
      const bodyParams = expectParameters(req.body, res, ["pHash"]);
      if (bodyParams === null) {
        return;
      }
      try {
        const tokens = await authenticateUser(bodyParams.pHash);
        returnUserTokens(res, tokens);
      } catch (e) {
        if (e instanceof AuthError) {
          res.status(401).json("Incorrect password!");
        } else {
          console.error(e);
          res.status(500).json("Something went wrong on the server!");
        }
      }
      break;
    }
    case "refresh": {
      const bodyParams = expectParameters(req.body, res, ["refreshToken"]);
      if (bodyParams === null) {
        return;
      }

      try {
        const tokens = await refreshSession(bodyParams.refreshToken);
        returnUserTokens(res, tokens);
      } catch (e) {
        if (e instanceof AuthError) {
          res.status(401).json("Invalid refresh token!");
        } else {
          console.error(e);
          res.status(500).json("Something went wrong on the server!");
        }
      }
      break;
    }
  }
}

function returnUserTokens(
  res: VercelResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  const accessCookie = cookie.serialize(USER_TOKEN, tokens.accessToken, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 20 * 60,
    sameSite: "strict",
  });

  setCookie(res, accessCookie);
  return res.json({ refreshToken: tokens.refreshToken });
}
