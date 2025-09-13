import { Outlet } from "react-router";
import { ProtectedRoute } from "@project/remix/app/components/general/protected-route";

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

export const handle = {
  protected: true,
};

export { default as ErrorBoundary } from "@project/remix/app/components/general/error-boundary";
