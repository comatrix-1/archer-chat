import { Outlet } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

// This tells React Router that this is a layout route
export const handle = {
  // You can add route metadata here if needed
  protected: true
};

// This ensures the layout is applied to all child routes
export { default as ErrorBoundary } from "~/components/ErrorBoundary";
