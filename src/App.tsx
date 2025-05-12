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
import ExploreGuest from "./views/ExploreGuest";
import Cookies from "js-cookie";
import { Record } from "./surreal";

function App() {
  const [client, setClient] = useState<
    { db: Surreal; auth: Record | undefined } | undefined
  >(undefined);
  const [isLoadingInitialAuth, setIsLoadingInitialAuth] = useState(true);

  useEffect(() => {
    const initDBAndAuth = async () => {
      setIsLoadingInitialAuth(true);

      try {
        const db = await getDb();
        let authInfo: Record | undefined = undefined;

        const jwt = Cookies.get("jwt");
        if (jwt !== undefined) {
          try {
            await db.authenticate(jwt);
            authInfo = await db.info();
          } catch (e) {
            // If authentication fails, remove the invalid JWT
            console.error("Failed to authenticate with JWT:", e);
            Cookies.remove("jwt");
          }
        } else {
          console.log("No JWT found, user is not authenticated.");
        }

        setClient({ db, auth: authInfo });
      } catch (error) {
        console.error("Failed to initialize DB or check auth:", error);
      } finally {
        setIsLoadingInitialAuth(false);
      }
    };

    initDBAndAuth();
  }, []);

  if (
    isLoadingInitialAuth ||
    client === undefined ||
    client.db.status !== ConnectionStatus.Connected
  ) {
    return (
      <Router>
        <Routes>
          <Route
            path="*"
            element={
              <MainLayout>
                <div>Loading...</div>
              </MainLayout>
            }
          />{" "}
          {/* TODO: Animated loading */}
        </Routes>
      </Router>
    );
  }

  return (
    <DbContext.Provider value={client}>
      <Router>
        <Routes>
          {/* Public pages */}
          <Route element={<MainLayout />}>
            <Route
              path="/explore"
              element={
                client.auth !== undefined ? <Explore /> : <ExploreGuest />
              }
            />
            <Route path="/details" element={<Details />} />
          </Route>
          /* Private pages (require sign in) */
          {/* ProtectedRoute will check client.auth */}
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
          /* Authentication pages, redirect if authenticated */
          {/* ProtectedRoute with authScreen={true} will check client.auth */}
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
