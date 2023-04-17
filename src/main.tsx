import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/assets/sass/index.scss";
import { Login } from "@/components/Login";
import { MyMusicLibrary } from "@/Music/MusicLibrary";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

function Main() {
  const [userLoggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    MyMusicLibrary.tryLoadToken().then((isValid) => {
      if (isValid) {
        MyMusicLibrary.loadLibrary();
      }
    });
    MyMusicLibrary.onLoaded.push(() => {
      setLoggedIn(true);
    });
  }, []);

  return userLoggedIn ? <App /> : <Login />;
}
