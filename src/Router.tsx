import { VercelAPI } from "@/src/api/vercel-API";
import App from "@/src/components/App";
import { Login } from "@/src/components/auth/Login";
import { FullCover } from "@/src/components/utils/loading/FullCover";
import { getApplicationDebugConfig } from "@/config/app";
import { Suspense } from "react";
import {
  Await,
  createBrowserRouter,
  redirect,
  RouterProvider,
  useLoaderData,
} from "react-router-dom";
import { YoutubeAPI } from "@/src/api/youtube-API";
import { RealtimeStatus } from "@/src/api/ably-client";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,

    loader: async () => {
      if (!(await VercelAPI.isLoggedIn())) {
        return redirect("/login");
      }

      YoutubeAPI.load();
      RealtimeStatus.connect();

      return null;
    },
  },
  {
    path: "/login",
    element: <Login />,
    loader: () => {
      const debug = getApplicationDebugConfig();
      if (debug && !debug.useLogin) {
        return redirect("/");
      }
      return null;
    },
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}

// eslint-disable-next-line react/no-multi-comp
function AppWrapper() {
  const routerLoadingData = useLoaderData() as Promise<unknown>;

  return (
    <Suspense fallback={<FullCover />}>
      <Await resolve={routerLoadingData}>
        <App />
      </Await>
    </Suspense>
  );
}
