import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/src/assets/sass/index.scss";
import { Login } from "@/src/components/Login";
import { MyMusicLibrary } from "@/Music/Library/MusicLibrary";
import { YoutubeAPI } from "./api/YoutubeAPI";
import { isAuthenticatable } from "./Music/Library/Authenticatable";
import { LambdaStatus } from "./Music/Library/AblyClient";
(async () => {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Catastrophic Failure! Failed to load application!");
    return;
  }
  root.innerHTML = `
  <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:row;font-size:5em">
    <h1>Loading</h1>
    <div style="margin-left:0.5em;width:1em;height:1em;margin-top:auto;margin-bottom:auto;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide loading"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    </div>
    <style>
      .loading {
        width:100%;
        animation: rotation 1s infinite linear;
      }
      @keyframes rotation {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(359deg);
        }
      }
    </style>
  </div>
  `;
  await YoutubeAPI.load();
  let loginRequired = false;
  if (isAuthenticatable(MyMusicLibrary)) {
    const isValid = MyMusicLibrary.isAuthenticated();
    if (!isValid) {
      loginRequired = true;
    }
  }

  if (!loginRequired) {
    await LambdaStatus.connect();
  }
  root.innerHTML = "";
  ReactDOM.createRoot(root as HTMLElement).render(
    <React.StrictMode>
      {loginRequired ? <WaitForLogin /> : <App />}
    </React.StrictMode>
  );
})();

function WaitForLogin() {
  const [userLoggedIn, setLoggedIn] = useState(false);

  return userLoggedIn ? (
    <App />
  ) : (
    <Login
      onAuthenticate={() => {
        setLoggedIn(true);
      }}
    />
  );
}
