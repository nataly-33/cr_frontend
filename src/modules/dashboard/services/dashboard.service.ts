import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type { PaginatedResponse } from "@core/types";

export interface DashboardStats {
  totalPatients: number;
  totalDocuments: number;
  totalClinicalRecords: number;
  activeToday: number;
  averageMonthly: number;
  recentDocuments: Array<{
    id: string;
    title: string;
    patient_name: string;
    created_at: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user_name: string;
  }>;
}

export const dashboardService = {
  /**
   * Obtiene estadísticas generales del dashboard
   * Combina datos de pacientes, documentos, historias clínicas y auditoría
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Obtener datos en paralelo
      const [patientsResponse, documentsResponse, recordsResponse, auditResponse] =
        await Promise.all([
          apiService.get<PaginatedResponse<any>>(
            `${ENDPOINTS.PATIENTS.LIST}?page_size=1`
          ),
          apiService.get<PaginatedResponse<any>>(
            `${ENDPOINTS.DOCUMENTS.LIST}?page_size=10&ordering=-created_at`
          ),
          apiService.get<PaginatedResponse<any>>(
            `${ENDPOINTS.CLINICAL_RECORDS.LIST}?page_size=1`
          ),
          apiService.get<PaginatedResponse<any>>(
            `${ENDPOINTS.AUDIT.LIST}?page_size=10&ordering=-created_at`
          ),
        ]);

      const patientsData = patientsResponse.data as PaginatedResponse<any>;
      const documentsData = documentsResponse.data as PaginatedResponse<any>;
      const recordsData = recordsResponse.data as PaginatedResponse<any>;
      const auditData = auditResponse.data as PaginatedResponse<any>;

      // Contar documentos activos hoy
      const today = new Date().toISOString().split("T")[0];
      const activeTodayCount = (documentsData.results || []).filter(
        (doc: any) => doc.created_at?.includes(today)
      ).length;

      return {
        totalPatients: patientsData.count || 0,
        totalDocuments: documentsData.count || 0,
        totalClinicalRecords: recordsData.count || 0,
        activeToday: activeTodayCount,
        averageMonthly: Math.round((documentsData.count || 0) / 30),
        recentDocuments: (documentsData.results || [])
          .slice(0, 5)
          .map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            patient_name: doc.patient_name || "Sin nombre",
            created_at: doc.created_at,
          })),
        recentActivity: (auditData.results || [])
          .slice(0, 5)
          .map((activity: any) => ({
            id: activity.id,
            action: activity.action,
            timestamp: activity.created_at,
            user_name: activity.user_name || "Sistema",
          })),
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalPatients: 0,
        totalDocuments: 0,
        totalClinicalRecords: 0,
        activeToday: 0,
        averageMonthly: 0,
        recentDocuments: [],
        recentActivity: [],
      };
    }
  },

  /**
   * Obtiene información resumida rápidamente
   */
  getQuickStats: async () => {
    try {
      const [patients, documents, records] = await Promise.all([
        apiService.get<PaginatedResponse<any>>(
          `${ENDPOINTS.PATIENTS.LIST}?page_size=1`
        ),
        apiService.get<PaginatedResponse<any>>(
          `${ENDPOINTS.DOCUMENTS.LIST}?page_size=1`
        ),
        apiService.get<PaginatedResponse<any>>(
          `${ENDPOINTS.CLINICAL_RECORDS.LIST}?page_size=1`
        ),
      ]);

      const patientsData = patients.data as PaginatedResponse<any>;
      const documentsData = documents.data as PaginatedResponse<any>;
      const recordsData = records.data as PaginatedResponse<any>;

      return {
        patients: patientsData.count || 0,
        documents: documentsData.count || 0,
        clinicalRecords: recordsData.count || 0,
      };
    } catch (error) {
      console.error("Error fetching quick stats:", error);
      return {
        patients: 0,
        documents: 0,
        clinicalRecords: 0,
      };
    }
  },
};
