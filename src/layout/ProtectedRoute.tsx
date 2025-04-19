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

      // Pass the token to authenticate method
      if (token !== undefined) {
        await (db.authenticate(token as Token), db.info());
        const res = await db.info();
        if (res !== undefined) {
          // When res is not undefined it means the client was able to select the users info (which is the minimum required) and thus the session is ready :D
          setIsAuthenticated(true);
        }
      }
      setIsAuthenticated(false);
    };

    checkAuth();
  });

  if (isAuthenticated === null) {
    /* TODO: Loading thingy */
    return <div></div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
