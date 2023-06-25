import {
  Await,
  RouterProvider,
  createBrowserRouter,
  defer,
  redirect,
  useLoaderData,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import React, { Suspense } from "react";

import App from "@/src/components/App";
import { Login } from "@/src/components/auth/Login";
import { YoutubeAPI } from "@/src/api/youtube-API";
import { VercelAPI } from "@/src/api/vercel-API";
import { LambdaStatus } from "@/src/api/ably-client";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";

import "react-toastify/dist/ReactToastify.min.css";
import "@/src/assets/sass/index.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,

    loader: async () => {
      if (!(await VercelAPI.isLoggedIn())) {
        return redirect("/login");
      }

      const youtubeAPILoadedPromise = YoutubeAPI.load();
      const lambdaConnectionStatusPromise = LambdaStatus.connect();
      return defer({
        youtubeAPILoadedPromise,
        lambdaConnectionStatusPromise,
        timeout: new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 5000);
        }),
      });
    },
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
const root = document.getElementById("root");

if (!root) {
  throw new Error("Catastrophic Failure! Failed to load application!");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer
      position="bottom-right"
      draggable={true}
      draggableDirection="x"
      limit={5}
      theme="colored"
    />
  </React.StrictMode>
);

function Root() {
  const data = useLoaderData() as { [key: string]: Promise<unknown> };

  return (
    <Suspense fallback={<FullCover />}>
      <Await resolve={Promise.all(Object.values(data))}>
        <App />
      </Await>
    </Suspense>
  );
}
