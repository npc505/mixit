import { useEffect, useState } from "react";
import "./App.css";
import Details from "./views/Details";
import { getDb, Surreal } from "./surreal";
import LandingPage from "./views/LandingPage";
import Login from "./views/Login";
import Register from "./views/Register";
import Moodboard from "./views/Moodboard";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  const [client, setClient] = useState<Surreal>();

  useEffect(() => {
    const initDB = async () => {
      const db = await getDb();
      setClient(db);
    };

    initDB();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login db={client} />} />
          <Route path="/register" element={<Register db={client} />} />
          <Route path="/details" element={<Details />} />
          <Route path="/moodboard" element={<Moodboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
