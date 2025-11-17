import { apiService } from "@/shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";

export interface AnalyticsData {
  patients_by_month: PatientByMonth[];
  documents_by_type: DocumentByType[];
  activity_by_day: ActivityByDay[];
  top_specialties: TopSpecialty[];
  top_doctors: TopDoctor[];
  summary: AnalyticsSummary;
}

export interface PatientByMonth {
  month: string;
  value: number;
  date: string;
}

export interface DocumentByType {
  type: string;
  label: string;
  count: number;
}

export interface ActivityByDay {
  day: string;
  value: number;
  date: string;
}

export interface TopSpecialty {
  specialty: string;
  count: number;
}

export interface TopDoctor {
  doctor: string;
  documents: number;
}

export interface AnalyticsSummary {
  total_patients: number;
  patients_this_month: number;
  total_documents: number;
  documents_this_month: number;
  total_records: number;
  records_this_month: number;
  activity_today: number;
}

export const analyticsService = {
  /**
   * Obtener datos analíticos completos
   * @param months - Número de meses a mostrar (default: 12)
   * @param days - Número de días para actividad (default: 30)
   */
  getOverview: async (
    months: number = 12,
    days: number = 30
  ): Promise<AnalyticsData> => {
    try {
      const response = await apiService.get<AnalyticsData>(
        `${ENDPOINTS.REPORTS.ANALYTICS.OVERVIEW}?months=${months}&days=${days}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener analytics: ${error}`);
    }
  },

  /**
   * Obtener datos de pacientes por mes
   */
  getPatientsData: async (months: number = 12): Promise<PatientByMonth[]> => {
    try {
      const data = await analyticsService.getOverview(months);
      return data.patients_by_month;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener datos de documentos por tipo
   */
  getDocumentsData: async (): Promise<DocumentByType[]> => {
    try {
      const data = await analyticsService.getOverview();
      return data.documents_by_type;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener datos de actividad por día
   */
  getActivityData: async (days: number = 30): Promise<ActivityByDay[]> => {
    try {
      const data = await analyticsService.getOverview(12, days);
      return data.activity_by_day;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener especialidades top
   */
  getTopSpecialties: async (): Promise<TopSpecialty[]> => {
    try {
      const data = await analyticsService.getOverview();
      return data.top_specialties;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener doctores top
   */
  getTopDoctors: async (): Promise<TopDoctor[]> => {
    try {
      const data = await analyticsService.getOverview();
      return data.top_doctors;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener resumen general
   */
  getSummary: async (): Promise<AnalyticsSummary> => {
    try {
      const data = await analyticsService.getOverview();
      return data.summary;
    } catch (error) {
      throw error;
    }
  },
};
