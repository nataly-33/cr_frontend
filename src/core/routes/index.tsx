import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@modules/auth/pages/LoginPage";
import { DashboardPage } from "@modules/dashboard/pages/DashboardPage";
import { AnalyticsDashboardPage } from "@modules/analytics/pages";
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
import {
  UsersListPage,
  UserFormPage,
  RolesListPage,
  RoleFormPage,
} from "@modules/users/pages";
import {
  ReportsPage,
  ReportViewerPage,
} from "@modules/reports/pages";
import {
  ClinicalFormsListPage,
  TriageFormPage,
} from "@modules/clinical-forms/pages";
import { SettingsPage } from "@modules/settings/pages";
import {
  ProfilePage,
  PreferencesPage,
  SecurityPage,
} from "@modules/settings/pages";
import { NotificationPreferencesPage } from "@modules/notifications/pages/NotificationPreferencesPage";
import { AdminPage } from "@modules/admin/pages";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />

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

        {/* Formularios Clínicos */}
        <Route path="/clinical-forms" element={<ClinicalFormsListPage />} />
        <Route path="/clinical-forms/triage/new" element={<TriageFormPage />} />
        <Route path="/clinical-forms/triage/:id/edit" element={<TriageFormPage />} />

        {/* Usuarios */}
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/new" element={<UserFormPage />} />
        <Route path="/users/:id/edit" element={<UserFormPage />} />

        {/* Roles */}
        <Route path="/roles" element={<RolesListPage />} />
        <Route path="/roles/new" element={<RoleFormPage />} />
        <Route path="/roles/:id/edit" element={<RoleFormPage />} />

        {/* Reportes */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/:id" element={<ReportViewerPage />} />

        {/* Configuración */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/preferences" element={<PreferencesPage />} />
        <Route path="/settings/security" element={<SecurityPage />} />
        <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />

        {/* Administración */}
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* Redirect por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
