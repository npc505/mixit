import { FcGoogle } from "react-icons/fc";
import Navbar from "../components/Navbar";
import Gallery from "../components/Gallery";
import Footer from "../components/Footer";
import { Surreal } from "../surreal";
import { useState } from "react";
import {
  handleGoogleCallback,
  handleGoogleSignIn,
  loadGoogleScript,
  register,
} from "../surreal/auth";
import GoogleAuth from "../components/GoogleAuth";

declare global {
  interface Window {
    google?: any;
  }
}

function Register(props: { db: Surreal | undefined }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (props.db !== undefined) {
    loadGoogleScript(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (res: any) => {
            await handleGoogleCallback(res, props.db);
          },
        });
      }
    });
  }

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 p-8 m-2 md:m-24 lg:m-24 gap-8 items-center justify-center">
          <div className="px-4 md:px-20 lg:px-20">
            <p className="text-4xl text-black font-bold text-center font-poppins pb-10">
              Create an account
            </p>
            <div className="relative z-0 w-full mb-5 group">
              <input
                name="floating_email"
                id="floating_email"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                placeholder=" "
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Email address
              </label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <input
                name="floating_email"
                id="floating_email"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                placeholder=" "
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Username
              </label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="password"
                name="floating_email"
                id="floating_email"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                placeholder=" "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Password
              </label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="password"
                name="floating_email"
                id="floating_email"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                placeholder=" "
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Confirm Password
              </label>
            </div>
            <div className="flex flex-col items-center justify-center pt-8">
              <button
                className="bg-black text-lg text-white rounded-full py-2 px-12"
                onClick={async () => {
                  if (props.db != undefined) {
                    await register(props.db, {
                      username,
                      email,
                      password,
                    });
                  }
                }}
              >
                Register
              </button>

              <div className="flex items-center justify-center w-full py-12">
                <div className="w-28 md:w-60 lg:w-60 border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 cursor-pointer">
                  or register with
                </span>
                <div className="w-28 md:w-60 lg:w-60 border-t border-gray-300"></div>
              </div>
              <GoogleAuth />
            </div>
          </div>
          <div className="flex justify-center">
            <Gallery />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
