import '../App.css'
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import AutoCarousel from '../components/AutoCarousel'; 

const phrases = ["Wear It", "Dress Smart", "Mix & Match", "Style Now"];



function LandingPage() {

    const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div>
        <nav className="bg-white border-gray-200">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <p className='text-3xl font-bold'>MIXIT</p>
            </a>
            <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button type="button" className="text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-2 text-center flex flex-row justify-center items-center">MIXI <img src="src\assets\svg\hook.svg" alt="" className='w-10 pl-2'/></button>
            <button data-collapse-toggle="navbar-cta" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" aria-controls="navbar-cta" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
            </div>
            <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
                <li>
                <a href="#" className="block py-2 px-3 md:p-0 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-gray-400" aria-current="page">Home</a>
                </li>
                <li>
                <a href="#" className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">Explore</a>
                </li>
                <li>
                <a href="#" className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700">My Closet</a>
                </li>
            </ul>
            </div>
        </div>
        </nav>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 p-24'>
            <div>
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
                        <button type="button" className="text-white border-2 border-solid-black bg-black hover:bg-white hover:text-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-lg px-8 py-2 text-center">Sign In</button>
                        <button type="button" className="text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-lg px-8 py-2 text-center"  onClick={handleLoginClick}>Log In</button>
                    </div>
            </div>
            <div className='pt-10 md:pt-0 lg:pt-0'>
            <AutoCarousel />
            </div>
        </div>

        <footer className="bg-black">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-gray-500 sm:text-center">© 2025 <a href="https://flowbite.com/" className="hover:underline">MIXIT</a>. All Rights Reserved.</span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 sm:mt-0">
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">About</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline">Contact</a>
                    </li>
                </ul>
            </div>
        </footer>


    </div>
  )
}

export default LandingPage
