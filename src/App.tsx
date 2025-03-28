import { useEffect, useState } from "react";
import "./App.css";
import Details from "./views/Details";
import { getDb, Surreal } from "./surreal";
import LandingPage from "./views/LandingPage";
import Login from "./views/Login";
import Register from "./views/Register";
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
        </Routes>
      </Router>
    </>
  );
}

export default App;
