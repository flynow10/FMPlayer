import {
  Await,
  RouterProvider,
  createBrowserRouter,
  defer,
  redirect,
  useLoaderData,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import "@/src/assets/sass/index.scss";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer } from "react-toastify";
import React, { Suspense } from "react";
import App from "./App";
import { Login } from "./components/Login";
import { YoutubeAPI } from "./api/YoutubeAPI";
import { VercelAPI } from "./api/VercelAPI";
import { LambdaStatus } from "./Music/Library/AblyClient";
import { FullCover } from "./components/pages/LoadingPages";
(async () => {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Catastrophic Failure! Failed to load application!");
    return;
  }
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
  ReactDOM.createRoot(root as HTMLElement).render(
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
})();

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
