import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DbContext } from "../surreal";
import { Token } from "surrealdb";
import Cookies from "js-cookie";

function ProtectedRoute() {
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
            // When res is not undefined it means the client was able to select the users info (which is the minimum required) and thus the session is ready :D
            authenticated = true;
          }
        } catch (error) {
          console.error("Authentication error:", error);
        }
      }

      setIsAuthenticated(authenticated);
    };

    checkAuth();
  }, [db]);

  if (isAuthenticated === null) {
    /* TODO: Loading thingy */
    return <div></div>;
  }

  return isAuthenticated === true ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
