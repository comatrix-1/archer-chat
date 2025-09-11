import { Navigate, Outlet, useLocation } from "react-router";
import LoadingSpinner from "~/components/LoadingSpinner";
import { useAuth } from "~/contexts/AuthContext";

interface ProtectedRouteProps {
  readonly children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner isLoading={true} />
      </div>
    );
  }

  if (!user) {
    const redirectTo = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }

  return children || <Outlet />;
}