import Gallery from "../components/Gallery";
import { DbContext } from "../surreal";
import { useContext, useState } from "react";
import {
  handleGoogleCallback,
  loadGoogleScript,
  Method,
  register,
} from "../surreal/auth";
import GoogleAuth from "../components/GoogleAuth";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const db = useContext(DbContext);
  const navigate = useNavigate();

  loadGoogleScript(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (res: unknown) => {
          if (await handleGoogleCallback(res, db, Method.Register)) {
            navigate("/explore");
          }
        },
      });
    }
  });

  return (
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
            <Button
              onClick={async () => {
                const res = await register(db, {
                  username,
                  email,
                  password,
                });
                if (res === true) {
                  navigate("/explore");
                }
              }}
              isActive={true}
              label="Register"
            />

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
  );
}

export default Register;
