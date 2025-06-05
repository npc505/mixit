import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DbContext } from "../surreal";

function ProtectedRoute({ authScreen = false }: { authScreen?: boolean }) {
  const { db, auth } = useContext(DbContext);
  const isAuth = auth !== undefined;

  if (db === undefined) {
    return <div></div>;
  }

  if (authScreen === true && isAuth) {
    return <Navigate to="/closet" />;
  } else if (isAuth || authScreen) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
