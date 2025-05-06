import { useEffect, useState } from "react";
import "./App.css";
import Details from "./views/Details";
import { DbContext, getDb, Surreal } from "./surreal";
import LandingPage from "./views/LandingPage";
import Login from "./views/Login";
import Register from "./views/Register";
import Moodboard from "./views/Moodboard";
import Explore from "./views/Explore";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Closet from "./views/Profile";
import ProtectedRoute from "./layout/ProtectedRoute";
import { ConnectionStatus } from "surrealdb";
import Upload from "./views/Upload";

function App() {
  const [client, setClient] = useState<Surreal | undefined>(undefined);

  useEffect(() => {
    const initDB = async () => {
      const db = await getDb();
      setClient(db);
    };

    initDB();
  }, []);

  if (client === undefined || client.status != ConnectionStatus.Connected) {
    return (
      <Router>
        <Routes>
          <Route element={<MainLayout />}>/* TODO: Animated loading */</Route>
        </Routes>
      </Router>
    );
  }

  return (
    <DbContext.Provider value={client}>
      <Router>
        <Routes>
          /* Public pages */
          <Route element={<MainLayout />}>
            <Route path="/explore" element={<Explore />} />
            <Route path="/details" element={<Details />} />
          </Route>
          /* Private pages (require sign in) */
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout pad4={false} />}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/closet" element={<Closet />} />
              <Route path="/closet/:id" element={<Closet />} />
            </Route>
            <Route element={<MainLayout />}>
              <Route path="/moodboard" element={<Moodboard />} />
            </Route>
          </Route>
          /* Register pages, redirect to /explore when ready */
          <Route element={<ProtectedRoute authScreen={true} />}>
            <Route element={<MainLayout pad4={false} />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </DbContext.Provider>
  );
}

export default App;
