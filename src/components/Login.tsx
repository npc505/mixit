import {getDb} from "../surreal/client"
import {login} from "../surreal/auth";
import { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState ("");
    const [password, setPassword] = useState ("");


    return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="max-w-sm mx-auto">
            <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">user</label>
            <input 
                type="username" 
                id="username" 
                value={username}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                placeholder="username" 
                required 
                onChange={(e) => setUsername(e.target.value)}
            />
            </div>
            <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">password</label>
            <input 
                type="password" 
                id="password" 
                value={password}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                required 
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
            <button onClick={async () => {await login(await getDb(),username,password); }}
            type="submit" 
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            >
            Submit
            </button>
        </div>
    </div>
    );
};

export default Login;