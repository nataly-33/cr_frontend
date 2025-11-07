import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";

export interface DashboardOverview {
  patients: {
    total: number;
    new_this_month: number;
  };
  documents: {
    total: number;
    today: number;
    this_week: number;
  };
  clinical_records: {
    total: number;
    active: number;
  };
  users: {
    total: number;
    active: number;
  };
  forms: {
    total: number;
    today: number;
  };
  timestamp: string;
}

export interface DashboardActivity {
  id: string;
  action: string;
  model: string;
  user: {
    id: string | null;
    name: string;
  };
  timestamp: string;
  details?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
}

export interface DocumentStats {
  by_type: Array<{ type: string; count: number }>;
  by_specialty: Array<{ specialty: string; count: number }>;
  signatures: {
    signed: number;
    unsigned: number;
  };
  per_day: Array<{
    date: string;
    count: number;
  }>;
  timestamp: string;
}

export interface FormStats {
  by_type: Array<{ type: string; count: number }>;
  per_day: Array<{
    date: string;
    count: number;
  }>;
  top_users: Array<{
    name: string;
    forms: number;
  }>;
  timestamp: string;
}

export interface UsersActivity {
  active_users: number;
  users_activity: Array<{
    user_id: string;
    total_actions: number;
    by_action: Record<string, number>;
  }>;
  timestamp: string;
}

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
   * Obtiene descripción general del dashboard
   */
  getOverview: async (): Promise<DashboardOverview> => {
    try {
      const response = await apiService.get<DashboardOverview>(
        ENDPOINTS.DASHBOARD.OVERVIEW
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },

  /**
   * Obtiene actividad reciente del sistema
   */
  getActivity: async (days: number = 7): Promise<DashboardActivity[]> => {
    try {
      const response = await apiService.get<{ activity: DashboardActivity[] }>(
        `${ENDPOINTS.DASHBOARD.ACTIVITY}?days=${days}`
      );
      return response.data.activity;
    } catch (error) {
      console.error("Error fetching dashboard activity:", error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de documentos
   */
  getDocumentsStats: async (): Promise<DocumentStats> => {
    try {
      const response = await apiService.get<DocumentStats>(
        ENDPOINTS.DASHBOARD.DOCUMENTS_STATS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching documents stats:", error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de formularios
   */
  getFormsStats: async (): Promise<FormStats> => {
    try {
      const response = await apiService.get<FormStats>(
        ENDPOINTS.DASHBOARD.FORMS_STATS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching forms stats:", error);
      throw error;
    }
  },

  /**
   * Obtiene actividad de usuarios
   */
  getUsersActivity: async (days: number = 7): Promise<UsersActivity> => {
    try {
      const response = await apiService.get<UsersActivity>(
        `${ENDPOINTS.DASHBOARD.USERS_ACTIVITY}?days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching users activity:", error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas generales del dashboard (compatibilidad)
   * Combina overview y activity
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [overview, activity] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getActivity(7),
      ]);

      return {
        totalPatients: overview.patients.total,
        totalDocuments: overview.documents.total,
        totalClinicalRecords: overview.clinical_records.total,
        activeToday: overview.documents.today,
        averageMonthly: Math.round(overview.documents.total / 30),
        recentDocuments: [], // Opcional: obtener por separado si es necesario
        recentActivity: activity.map((act) => ({
          id: act.id,
          action: act.action,
          timestamp: act.timestamp,
          user_name: act.user.name,
        })),
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  /**
   * Obtiene información resumida rápidamente
   */
  getQuickStats: async () => {
    try {
      const overview = await dashboardService.getOverview();
      return {
        patients: overview.patients.total,
        documents: overview.documents.total,
        clinicalRecords: overview.clinical_records.total,
        activeUsers: overview.users.active,
      };
    } catch (error) {
      console.error("Error fetching quick stats:", error);
      return {
        patients: 0,
        documents: 0,
        clinicalRecords: 0,
        activeUsers: 0,
      };
    }
  },
};
