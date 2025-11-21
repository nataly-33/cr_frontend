import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Public
import { LandingPage } from "@modules/public/pages/LandingPage";
import { RegisterPage } from "@modules/public/pages/RegisterPage";
import { ActivatePage } from "@modules/public/pages/ActivatePage";
import { RegistrationSuccessPage } from "@modules/public/pages/RegistrationSuccessPage";

// Auth
import { LoginPage } from "@modules/auth/pages/LoginPage";

// Protected / App
import { DashboardPage } from "@modules/dashboard/pages/DashboardPage";
import { AnalyticsDashboardPage } from "@modules/analytics/pages";
import { PatientsListPage } from "@modules/patients/pages/PatientsListPage";
import { PatientFormPage } from "@modules/patients/pages/PatientFormPage";
import { PatientDetailPage } from "@modules/patients/pages/PatientDetailPage";
import {
  ClinicalRecordDetailPage,
  ClinicalRecordFormPage,
  ClinicalRecordsListPage,
} from "@modules/clinical-records/pages";
import {
  DocumentsListPage,
  DocumentUploadPage,
  DocumentViewerPage,
  DocumentEditPage,
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
  ReportAIPage,
} from "@modules/reports/pages";
import {
  ClinicalFormsListPage,
  ClinicalFormDetailPage,
  ClinicalFormViewPage,
  FormTypeSelectorPage,
  TriageFormPage,
  ConsultationFormPage,
  PrescriptionFormPage,
  LabOrderFormPage,
  ImagingOrderFormPage,
  ProcedureFormPage,
  DischargeFormPage,
  ReferralFormPage,
} from "@modules/clinical-forms/pages";
import { SettingsPage } from "@modules/settings/pages";
import {
  NotificationsPage,
  PreferencesPage,
  SendNotificationPage,
} from "@modules/notifications";
import {
  BillingPage,
  PaymentHistoryPage,
  CheckoutSuccessPage,
  CheckoutCancelPage,
} from "@modules/billing";
import DiabetesPredictionPage from "@modules/ai/pages/DiabetesPredictionPage";
import DecisionTreePage from "@modules/ai/pages/DecisionTreePage";
import AIReportsPage from "@modules/ai/pages/AIReportsPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/activate/:token" element={<ActivatePage />} />
      <Route
        path="/registration-success"
        element={<RegistrationSuccessPage />}
      />
      <Route path="/login" element={<LoginPage />} />

      {/* Stripe Checkout callbacks (public) */}
      <Route path="/billing/success" element={<CheckoutSuccessPage />} />
      <Route path="/billing/cancel" element={<CheckoutCancelPage />} />

      {/* Protected routes (nested approach - active) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />

        {/* Patients */}
        <Route path="/patients" element={<PatientsListPage />} />
        <Route path="/patients/new" element={<PatientFormPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/patients/:id/edit" element={<PatientFormPage />} />
        <Route
          path="/patients/:patientId/diabetes-prediction"
          element={<DiabetesPredictionPage />}
        />

        {/* AI / Machine Learning */}
        <Route path="/ai/decision-tree" element={<DecisionTreePage />} />
        <Route path="/ai/reports" element={<AIReportsPage />} />

        {/* Clinical records */}
        <Route path="/clinical-records" element={<ClinicalRecordsListPage />} />
        <Route
          path="/clinical-records/new"
          element={<ClinicalRecordFormPage />}
        />
        <Route
          path="/clinical-records/:id"
          element={<ClinicalRecordDetailPage />}
        />
        <Route
          path="/clinical-records/:id/edit"
          element={<ClinicalRecordFormPage />}
        />

        {/* Documents */}
        <Route path="/documents" element={<DocumentsListPage />} />
        <Route path="/documents/upload" element={<DocumentUploadPage />} />
        <Route path="/documents/:id" element={<DocumentViewerPage />} />
        <Route path="/documents/:id/edit" element={<DocumentEditPage />} />

        {/* Clinical forms */}
        <Route path="/clinical-forms" element={<ClinicalFormsListPage />} />
        <Route path="/clinical-forms/:id" element={<ClinicalFormViewPage />} />
        <Route
          path="/clinical-forms/:id/edit"
          element={<ClinicalFormDetailPage />}
        />
        <Route path="/clinical-forms/new" element={<FormTypeSelectorPage />} />
        <Route path="/clinical-forms/triage/new" element={<TriageFormPage />} />
        <Route
          path="/clinical-forms/triage/:id/edit"
          element={<TriageFormPage />}
        />
        <Route
          path="/clinical-forms/consultation/new"
          element={<ConsultationFormPage />}
        />
        <Route
          path="/clinical-forms/consultation/:id/edit"
          element={<ConsultationFormPage />}
        />
        <Route
          path="/clinical-forms/prescription/new"
          element={<PrescriptionFormPage />}
        />
        <Route
          path="/clinical-forms/prescription/:id/edit"
          element={<PrescriptionFormPage />}
        />
        <Route
          path="/clinical-forms/lab-order/new"
          element={<LabOrderFormPage />}
        />
        <Route
          path="/clinical-forms/lab-order/:id/edit"
          element={<LabOrderFormPage />}
        />
        <Route
          path="/clinical-forms/imaging-order/new"
          element={<ImagingOrderFormPage />}
        />
        <Route
          path="/clinical-forms/imaging-order/:id/edit"
          element={<ImagingOrderFormPage />}
        />
        <Route
          path="/clinical-forms/procedure/new"
          element={<ProcedureFormPage />}
        />
        <Route
          path="/clinical-forms/procedure/:id/edit"
          element={<ProcedureFormPage />}
        />
        <Route
          path="/clinical-forms/discharge/new"
          element={<DischargeFormPage />}
        />
        <Route
          path="/clinical-forms/discharge/:id/edit"
          element={<DischargeFormPage />}
        />
        <Route
          path="/clinical-forms/referral/new"
          element={<ReferralFormPage />}
        />
        <Route
          path="/clinical-forms/referral/:id/edit"
          element={<ReferralFormPage />}
        />

        {/* Users */}
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/new" element={<UserFormPage />} />
        <Route path="/users/:id/edit" element={<UserFormPage />} />

        {/* Roles */}
        <Route path="/roles" element={<RolesListPage />} />
        <Route path="/roles/new" element={<RoleFormPage />} />
        <Route path="/roles/:id/edit" element={<RoleFormPage />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/:id" element={<ReportViewerPage />} />
        <Route path="/reports-ai" element={<ReportAIPage />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Notificaciones */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/notifications/preferences"
          element={<PreferencesPage />}
        />
        <Route path="/notifications/send" element={<SendNotificationPage />} />

        {/* Billing */}
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/billing/payments" element={<PaymentHistoryPage />} />
      </Route>

      {/* Redirect for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
