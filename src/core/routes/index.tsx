import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Auth
import { LoginPage } from "@/modules/auth/pages/LoginPage";

// Public (nuevas)
import { LandingPage } from "@/modules/public/pages/LandingPage";
import { RegisterPage } from "@/modules/public/pages/RegisterPage";
import { ActivationPage } from "@/modules/public/pages/ActivationPage";
import { RegistrationSuccessPage } from "@/modules/public/pages/RegistrationSuccessPage";

// Protected
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { PatientsListPage } from "@/modules/patients/pages/PatientsListPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/activate" element={<ActivationPage />} />
      <Route
        path="/registration-success"
        element={<RegistrationSuccessPage />}
      />
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <PatientsListPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
