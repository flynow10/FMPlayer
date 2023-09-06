import { RealtimeStatus } from "@/src/api/ably-client";
import { VercelAPI } from "@/src/api/vercel-API";
import { YoutubeAPI } from "@/src/api/youtube-API";
import App from "@/src/components/App";
import { Login } from "@/src/components/auth/Login";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { Suspense } from "react";
import {
  Await,
  createBrowserRouter,
  defer,
  redirect,
  RouterProvider,
  useLoaderData,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,

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

// eslint-disable-next-line react/no-multi-comp
function AppWrapper() {
  const routerLoadingData = useLoaderData() as {
    [key: string]: Promise<unknown>;
  };

  return (
    <Suspense fallback={<FullCover />}>
      <Await resolve={Promise.all(Object.values(routerLoadingData))}>
        <App />
      </Await>
    </Suspense>
  );
}
