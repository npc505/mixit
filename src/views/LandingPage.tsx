import '../App.css'
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import AutoCarousel from '../components/AutoCarousel';
import Footer from '../components/Footer' 

const phrases = ["Wear It", "Dress Smart", "Mix & Match", "Style Now"];



function LandingPage() {

    const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div>
        <Navbar />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 p-10 md:p-24 lg:p-24'>
            <div className='pl-0 md:pl-20 lg:pl-20'>
                {phrases.map((text, index) => (
                        <motion.p
                        key={index}
                        className="text-5xl md:text-7xl lg:text-7xl text-gray-200 font-bold font-poppins"
                        initial={{ y: -100, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.5, duration: 0.8, ease: "easeOut" }}
                        >
                        {text}
                        </motion.p>
                    ))}
                    <p className='text-5xl md:text-7xl lg:text-7xl text-gray-900 font-bold font-poppins'>Mix It</p>
                    <p className='text-2xl md:text-5xl lg:text-5xl text-gray-900 font-bold font-poppins pt-6'>Unleash your best fashion combinations</p>
                    <div className="pt-12 flex flex-col md:flex-row lg:flex-row gap-4">
                        <button type="button" className="text-white border-2 border-solid-black bg-black hover:bg-white hover:text-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-lg px-8 py-2 text-center" onClick={handleRegister}>Register</button>
                        <button type="button" className="text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-lg px-8 py-2 text-center"  onClick={handleLogin}>Log In</button>
                    </div>
            </div>
            <div className='pt-10 md:pt-0 lg:pt-0'>
            <AutoCarousel />
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default LandingPage
