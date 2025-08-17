import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import LoadingSpinner from "~/components/LoadingSpinner";

interface ProtectedRouteProps {
  readonly children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, user } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - Auth State:", {
    loading,
    user,
    currentPath: location.pathname,
  });

  if (loading) {
    console.log("ProtectedRoute - Loading auth state...");
    return <LoadingSpinner isLoading={true} />;
  }

  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to login");

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  console.log("ProtectedRoute - User authenticated, rendering content");
  return children || <Outlet />;
}
