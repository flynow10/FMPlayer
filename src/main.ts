import ReactDOM from "react-dom/client";
import React, { createElement } from "react";

import "react-toastify/dist/ReactToastify.min.css";
import "@/src/assets/sass/index.scss";
import ToastManager from "@/src/components/layout/ToastContainer";
import Router from "@/src/Router";
import { RealtimeStatus } from "@/src/api/ably-client";
import { YoutubeAPI } from "@/src/api/youtube-API";
const root = document.getElementById("root");

if (!root) {
  throw new Error("Catastrophic Failure! Failed to load application!");
}

ReactDOM.createRoot(root).render(
  createElement(React.StrictMode, null, [
    createElement(Router, { key: "router" }),
    createElement(ToastManager, { key: "toast-manager" }),
  ])
);
YoutubeAPI.load();
RealtimeStatus.connect();
