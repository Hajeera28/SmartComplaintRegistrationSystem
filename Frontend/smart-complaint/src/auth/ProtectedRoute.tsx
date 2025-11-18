import { Navigate, Outlet } from "react-router-dom";
import { tokenstore } from "./tokenstore";

type Props = {
  roles?: string[];
  redirectTo?: string;
};

export default function ProtectedRoute({ roles, redirectTo = "/get-started" }: Props) {
  const token = tokenstore.get();
  if (!token) return <Navigate to={redirectTo} replace />;
  
  if (roles && roles.length > 0) {
    const role = tokenstore.getRole();
    if (!role || !roles.includes(role)) {
      return <Navigate to="/forbidden" replace />;
    }
  }
  
  return <Outlet />;
}