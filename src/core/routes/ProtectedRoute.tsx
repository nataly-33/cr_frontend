import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@core/store/auth.store";
import { MainLayout } from "@shared/components/layout/MainLayout";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};
