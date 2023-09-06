import { RealtimeStatus } from "@/src/api/ably-client";
import { VercelAPI } from "@/src/api/vercel-API";
import { YoutubeAPI } from "@/src/api/youtube-API";
import App from "@/src/components/App";
import { Login } from "@/src/components/auth/Login";
import {
  createBrowserRouter,
  defer,
  redirect,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    loader: async () => {
      if (!(await VercelAPI.isLoggedIn())) {
        return redirect("/login");
      }

      const youtubeAPILoadedPromise = YoutubeAPI.load();
      const lambdaConnectionStatusPromise = RealtimeStatus.connect();
      return defer({
        youtubeAPILoadedPromise,
        lambdaConnectionStatusPromise,
      });
    },
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
