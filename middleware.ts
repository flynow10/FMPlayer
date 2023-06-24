import { verifyAuth } from "./api-lib/auth";

// Run middleware on all paths following /api/* except for the /api/tryAuth
export const config = {
  matcher: ["/api/((?!login).*)"],
};

export default async function middleware(req: Request) {
  // validate the user is authenticated
  const verifiedToken = await verifyAuth(req).catch((err) => {
    console.error(err.message);
  });

  if (!verifiedToken) {
    // if this an API request, respond with JSON
    if (new URL(req.url).pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({ error: { message: "Authentication Required" } }),
        { status: 401 }
      );
    }
    // otherwise, redirect to the set token page
    else {
      return Response.redirect(new URL("/", req.url));
    }
  }
}
