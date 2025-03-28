import { FcGoogle } from "react-icons/fc";
import { handleGoogleSignIn } from "../surreal/auth";

const GoogleAuth = () => {
  return (
    <div className="flex flex-row justify-center items-center gap-4">
      <button className="flex flex-row justify-center items-center gap-2 rounded-full border-2 border-white px-8 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer">
        <FcGoogle style={{ width: "30px", height: "30px" }} />
        <p className="text-black" onClick={handleGoogleSignIn}>
          Google
        </p>
      </button>
    </div>
  );
};

export default GoogleAuth;
