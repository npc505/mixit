import { useContext, useEffect, useState } from "react";
import "./App.css";
import Details from "./views/Details";
import { DbContext, getDb, Surreal } from "./surreal";
import LandingPage from "./views/LandingPage";
import Login from "./views/Login";
import Register from "./views/Register";
import Moodboard from "./views/Moodboard";
import Explore from "./views/Explore";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
  Navigate,
  // Navigate,
} from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import MyCloset from "./views/Profile";
import { Token } from "surrealdb";
import Cookies from "js-cookie";

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const db = useContext(DbContext);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("jwt");
      console.log(token);

      // Pass the token to authenticate method
      if (token !== undefined) {
        await (db.authenticate(token as Token), db.info());
        const res = await db.info();
        console.log(res);
        if (res !== undefined) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
  const [client, setClient] = useState<Surreal | undefined>();

  useEffect(() => {
    const initDB = async () => {
      const db = await getDb();
      setClient(db);
    };

    initDB();
  }, []);

  if (!client) {
    return;
  }

  return (
    <DbContext.Provider value={client}>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/details" element={<Details />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/moodboard" element={<Moodboard />} />
              <Route path="/closet" element={<MyCloset />} />
            </Route>
          </Route>
          <Route element={<MainLayout pad4={false} />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </Router>
    </DbContext.Provider>
  );
}

export default App;
