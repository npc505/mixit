import { Surreal, login } from "../surreal";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  handleGoogleCallback,
  loadGoogleScript,
  Method,
} from "../surreal/auth";
import GoogleAuth from "../components/GoogleAuth";

function Login(props: { db: Surreal | undefined }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [videoOpacity, setVideoOpacity] = useState("opacity-100");
  const [formOpacity, setFormOpacity] = useState("opacity-0");

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoOpacity("opacity-80");
      setFormOpacity("opacity-100");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (props.db !== undefined) {
    loadGoogleScript(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (res: unknown) => {
            await handleGoogleCallback(res, props.db, Method.Login);
          },
        });
      }
    });
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="relative w-full">
        <Navbar />
      </div>
      <div className="flex-grow grid grid-cols-1 justify-center items-center">
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-black">
          <video
            autoPlay
            loop
            muted
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoOpacity}`}
          >
            <source src="/assets/videos/login-video1.mp4" type="video/mp4" />
          </video>
        </div>

        <div
          className={`flex justify-center items-center transition-opacity duration-1000 ${formOpacity}`}
        >
          <div className="p-8 rounded-xl max-w-sm w-full">
            <p className="text-5xl text-white font-bold text-center">Log In</p>
            <div className="my-5">
              <label className="block mb-2 text-md font-medium text-white">
                Username or email
              </label>
              <input
                type="username"
                id="username"
                value={username}
                className="border-2 border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="username"
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="my-5">
              <label className="block mb-2 text-md font-medium text-white">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                className="border-2 border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-center items-center flex-col pt-2">
              <button
                onClick={async () => {
                  if (props.db != undefined) {
                    await login(props.db, {
                      username: username,
                      password: password,
                    });
                  }
                }}
                type="submit"
                className="text-white bg-black hover:bg-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-8 py-2.5 text-center"
              >
                Log in
              </button>
              <p className="text-gray-400 md:text-gray-300 lg:text-gray-300 pt-4 hover:underline cursor-pointer">
                Forgot my password
              </p>
              <div className="flex items-center w-full py-8">
                <div className="w-full border-t border-gray-300"></div>
                <span className="mx-4 text-gray-400 md:text-white lg:text-white">
                  or
                </span>
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <GoogleAuth />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Login;
