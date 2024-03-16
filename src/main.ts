import React, { createElement } from "react";

import ToastManager from "@/src/components/layout/toasts/ToastContainer";

import { Router } from "@/src/Router";

import "react-toastify/dist/ReactToastify.min.css";
import "react-contexify-props/ReactContexify.css";
import "@/src/assets/sass/index.scss";
import ReactDOM from "react-dom/client";

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
