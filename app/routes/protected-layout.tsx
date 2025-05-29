import { Outlet } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

export const handle = {
  protected: true
};

export { default as ErrorBoundary } from "~/components/ErrorBoundary";