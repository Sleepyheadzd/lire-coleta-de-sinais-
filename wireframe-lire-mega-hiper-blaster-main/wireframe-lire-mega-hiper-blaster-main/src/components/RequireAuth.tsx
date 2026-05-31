import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isAnonymous } = useAuth();

  if (!user.isLoggedIn) {
    if (isAnonymous) {
      return <Navigate to="/blog" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
