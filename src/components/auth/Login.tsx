import { Lock, Music4 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { VercelAPI } from "@/src/api/vercel-API";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    VercelAPI.loginWithPassword(password).then((loginResponse) => {
      if (loginResponse.success) {
        console.log("Login success");
        navigate("/");
      } else {
        addError(loginResponse.error);
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
    </>
  );
}
