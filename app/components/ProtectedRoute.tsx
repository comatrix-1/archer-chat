import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  readonly children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, loading, user } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute - Auth State:', {
    isLoggedIn,
    loading,
    user,
    currentPath: location.pathname
  });

  // Show loading spinner while auth state is being determined
  if (loading) {
    console.log('ProtectedRoute - Loading auth state...');
    return <LoadingSpinner isLoading={true} />;
  }

  // If not logged in and not loading, redirect to login
  if (!isLoggedIn) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    // Store the current location to redirect back after login
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering content');
  return children || <Outlet />;
}
