import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@modules/auth/pages/LoginPage";
import { DashboardPage } from "@modules/dashboard/pages/DashboardPage";
import { PatientsListPage } from "@modules/patients/pages/PatientsListPage";
import { PatientFormPage } from "@modules/patients/pages/PatientFormPage";
import { PatientDetailPage } from "@modules/patients/pages/PatientDetailPage";
import {
  ClinicalRecordDetailPage,
  ClinicalRecordFormPage,
} from "@modules/clinical-records/pages";
import {
  DocumentsListPage,
  DocumentUploadPage,
  DocumentViewerPage,
} from "@modules/documents/pages";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Pacientes */}
        <Route path="/patients" element={<PatientsListPage />} />
        <Route path="/patients/new" element={<PatientFormPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/patients/:id/edit" element={<PatientFormPage />} />

        {/* Historias Clínicas */}
        <Route path="/clinical-records/new" element={<ClinicalRecordFormPage />} />
        <Route
          path="/clinical-records/:id"
          element={<ClinicalRecordDetailPage />}
        />
        <Route
          path="/clinical-records/:id/edit"
          element={<ClinicalRecordFormPage />}
        />

        {/* Documentos */}
        <Route path="/documents" element={<DocumentsListPage />} />
        <Route path="/documents/upload" element={<DocumentUploadPage />} />
        <Route path="/documents/:id" element={<DocumentViewerPage />} />
      </Route>

      {/* Redirect por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
