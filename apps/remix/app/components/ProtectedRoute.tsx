import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import LoadingSpinner from "~/components/LoadingSpinner";
import { useEffect } from "react";

interface ProtectedRouteProps {
  readonly children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("Auth state changed:", { loading, user, path: location.pathname });
  }, [loading, user, location.pathname]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner isLoading={true} />
      </div>
    );
  }

  // If not authenticated, redirect to login with the return URL
  if (!user) {
    const redirectTo = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }

  // User is authenticated, render the protected content
  return children || <Outlet />;
}
