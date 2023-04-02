import classNames from "classnames";
import { Lock, Music4, X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";
import { MyMusicLibrary } from "./Music/MusicLibrary";

export function Login() {
  const [password, setPassword] = useState("");
  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    MyMusicLibrary.authenticateUser(password).then((isCorrect) => {
      if (isCorrect) {
        MyMusicLibrary.loadLibrary();
      } else {
        addError();
      }
    });
  };
  const [errors, setErrors] = useState<ReactNode[]>([]);
  const addError = () => {
    setErrors([...errors, <Error key={errors.length} />]);
  };
  return (
    <>
      <div className="flex justify-center items-center h-full">
        <form
          onSubmit={onLogin}
          className="shadow-[0px_0px_50px_-12px_rgb(0_0_0_/_0.25)]  rounded-2xl"
        >
          <div className="flex flex-col justify-items-center">
            <h1 className="m-7 text-4xl">Functional Music Player</h1>
            <div className="m-auto mb-5 max-w-fit rounded-full bg-sky-700 text-white p-2">
              <Music4 size={36} className="" />
            </div>
            <input
              type="password"
              placeholder="Password"
              id="password"
              className="border rounded-md mx-4 mb-6 p-2"
              value={password}
              onInput={(e) => {
                setPassword(e.currentTarget.value);
              }}
            />
            <button className="bg-green-400 mx-4 mb-4 p-2 rounded-md text-lg hover:bg-green-500 transition-colors">
              <Lock className="inline " /> Login
            </button>
          </div>
        </form>
      </div>
      <div className="absolute right-0 m-2 bottom-0 flex flex-col-reverse">
        {errors}
      </div>
    </>
  );
}

function Error() {
  const [closed, setClosed] = useState(false);
  const [closing, setClosing] = useState(false);
  const classes = classNames(
    "opacity-100 transition-[transform,_opacity] scale-y-100 m-1 rounded border-2 border-red-600 bg-red-500 text-white p-2 w-80",
    {
      "opacity-0 scale-y-0": closing,
      hidden: closed,
    }
  );
  const onClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosed(true);
    }, 200);
  };
  return (
    <div className={classes}>
      Wrong Password{" "}
      <button onClick={onClose} className="inline float-right">
        <X />
      </button>
    </div>
  );
}