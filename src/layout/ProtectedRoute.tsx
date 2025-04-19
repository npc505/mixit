import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DbContext } from "../surreal";
import { Token } from "surrealdb";
import Cookies from "js-cookie";

function ProtectedRoute({ authScreen = false }: { authScreen?: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const db = useContext(DbContext);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("jwt");
      let authenticated = false;

      if (token !== undefined) {
        try {
          await db.authenticate(token as Token);
          const res = await db.info();
          if (res?.id !== undefined && res?.id !== null) {
            authenticated = true;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          Cookies.remove("jwt");
        }
      }

      setIsAuthenticated(authenticated);
    };

    checkAuth();
  }, [db]);

  if (isAuthenticated === null) {
    return <div></div>;
  }

  if (isAuthenticated === true && authScreen === true) {
    return <Navigate to="/explore" />;
  } else {
    return isAuthenticated || authScreen ? (
      <Outlet />
    ) : (
      <Navigate to="/login" />
    );
  }
}

export default ProtectedRoute;
