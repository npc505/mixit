import "../App.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AutoCarousel from "../components/AutoCarousel";
import Button from "../components/Button";

const phrases = ["Wear It", "Dress Smart", "Mix & Match", "Style Now"];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:p-24 lg:p-24">
      <div className="pl-0 md:pl-20 lg:pl-20">
        {phrases.map((text, index) => (
          <motion.p
            key={index}
            className="text-5xl md:text-7xl lg:text-7xl text-gray-200 font-bold font-poppins"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: index * 0.5,
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            {text}
          </motion.p>
        ))}
        <p className="text-5xl md:text-7xl lg:text-7xl text-gray-900 font-bold font-poppins">
          Mix It
        </p>
        <p className="text-2xl md:text-5xl lg:text-5xl text-gray-900 font-bold font-poppins pt-6">
          Unleash your best fashion combinations
        </p>
        <div className="pt-12 flex flex-col md:flex-row lg:flex-row gap-4">
          <Button
            onClick={() => {
              navigate("/register");
            }}
            label="Register"
            isActive={true}
          />
          <Button
            onClick={() => {
              navigate("/login");
            }}
            label="Log In"
            isActive={false}
          />
        </div>
      </div>
      <div className="pt-10 md:pt-0 lg:pt-0">
        <AutoCarousel />
      </div>
    </div>
  );
}

export default LandingPage;
