import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@core/store/auth.store";
import { MainLayout } from "@shared/components/layout/MainLayout";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
