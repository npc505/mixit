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
} from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import MyCloset from "./views/Profile";
import { Token } from "surrealdb";

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const db = useContext(DbContext);

  useEffect(() => {
    const checkAuth = async () => {
      if (db !== undefined) {
        try {
          // Read JWT cookie and pass it to authenticate method
          const cookies = document.cookie.split(";");
          const jwtCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("jwt="),
          );
          const token = jwtCookie ? jwtCookie.split("=")[1].trim() : null;

          // Pass the token to authenticate method
          if (token !== undefined) {
            await (db.authenticate(token as Token), db.info());
            const res = await db.info();
            if (res !== undefined) {
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return false;
        }
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
  const [client, setClient] = useState<Surreal>();

  useEffect(() => {
    const initDB = async () => {
      const db = await getDb();
      setClient(db);
    };

    initDB();
  }, []);

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
