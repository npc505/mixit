import './App.css'
import {getDb} from "./surreal/client"
import {login} from "./surreal/auth";

function App() {

  return (
    <>
<div className="flex justify-center items-center min-h-screen bg-gray-200">
  <form className="max-w-sm mx-auto">
    <div className="mb-5">
      <label className="block mb-2 text-sm font-medium text-gray-900 ">user</label>
      <input 
        type="email" 
        id="email" 
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
        placeholder="name@flowbite.com" 
        required 
      />
    </div>
    <div className="mb-5">
      <label className="block mb-2 text-sm font-medium text-gray-900">password</label>
      <input 
        type="password" 
        id="password" 
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
        required 
      />
    </div>
    <button onClick={login}
      type="submit" 
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
    >
      Submit
    </button>
  </form>
</div>

    </>
  )
}

export default App
