import { FormEvent, useState } from "react";

import { VercelAPI } from "@/src/api/vercel-API";

import { Loader2, Lock, Music4 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    VercelAPI.loginWithPassword(password).then((loginResponse) => {
      console.log(loginResponse);
      if (loginResponse.success) {
        navigate("/");
      } else {
        setIsSubmitting(false);
        if (loginResponse.error instanceof Error) {
          addError(loginResponse.error.message);
        } else {
          addError(loginResponse.error);
        }
      }
    });
  };

  const addError = (
    error = "Something went wrong, please try again later."
  ) => {
    toast.error(error);
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
            <div className="m-auto mb-5 max-w-fit rounded-full dark:invert bg-sky-700 text-white p-2">
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

            <button
              disabled={isSubmitting}
              className="dark:invert bg-green-400 mx-4 mb-4 p-2 rounded-md text-lg hover:bg-green-500 transition-colors"
            >
              {isSubmitting && <Loader2 className="inline animate-spin mr-2" />}
              {!isSubmitting && <Lock className="inline mr-2" />}
              Login
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
