import { getApiDebugConfig } from "./config/api";
import { getJwtSecretKey, USER_TOKEN } from "./api-lib/constants";
import cookie from "cookie";
import { jwtVerify } from "jose";

// Run middleware on all paths following /api/* except for the /api/tryAuth
export const config = {
  matcher: ["/api/((?!token).*)"],
};

async function checkAccessToken(accessToken: string) {
  try {
    const verified = await jwtVerify(
      accessToken,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified;
  } catch (err) {
    return false;
  }
}

export default async function middleware(req: Request) {
  const debug = getApiDebugConfig();
  if (debug && !debug.useLogin) {
    return;
  }

  const cookies = req.headers.get("cookie");
  const parsedCookies = cookie.parse(cookies || "");
  const token = parsedCookies[USER_TOKEN];

  const parsedToken = await checkAccessToken(token);

  if (parsedToken === false) {
    return new Response(
      JSON.stringify({
        error: "Invalid access token",
      }),
      { status: 401 }
    );
  }
}
