import './App.css'
import Details from './views/Details';
import LandingPage from './views/LandingPage'
import Login from './views/Login'
import Register from './views/Register'
import Moodboard from './views/Moodboard'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {

  return (
    <>
 <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/details" element={<Details />} />
        <Route path="/moodboard" element={< Moodboard/>} />
      </Routes>
    </Router>
    </>
  )
}

export default App
