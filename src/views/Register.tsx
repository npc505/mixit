import { FcGoogle } from "react-icons/fc";
import Navbar from '../components/Navbar'
import Gallery from '../components/Gallery'
import Footer from '../components/Footer'

const Register = () => {

    return (
    <div>
        <Navbar />
        <div className="flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 p-8 m-2 md:m-24 lg:m-24 gap-8 items-center justify-center">
                <div className="px-4 md:px-20 lg:px-20">
                    <p className="text-4xl text-black font-bold text-center font-poppins pb-10">Create an account</p>
                    <div className="relative z-0 w-full mb-5 group">
                        <input name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer" placeholder=" " required />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email address</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer" placeholder=" " required />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="password" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer" placeholder=" " required />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="password" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer" placeholder=" " required />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm Password</label>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-8">
                        <button className="bg-black text-lg text-white rounded-full py-2 px-12">
                            Register
                        </button>

                        <div className="flex items-center justify-center w-full py-12">
                                <div className="w-28 md:w-60 lg:w-60 border-t border-gray-300"></div>
                                <span className="mx-4 text-gray-500 cursor-pointer">or register with</span>
                                <div className="w-28 md:w-60 lg:w-60 border-t border-gray-300"></div>
                        </div>

                        <div className="flex flex-row justify-center items-center gap-4">
                                <button className="flex flex-row justify-center items-center gap-2 rounded-full border-2 border-white px-8 py-2 bg-gray-100">
                                    <FcGoogle style={{ width: "30px", height: "30px" }} />
                                    <p className="text-black">Google</p>
                                </button>
                        </div>
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
};

export default Register;
