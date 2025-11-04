import { apiService } from "@shared/services/api.service";
import type {
  ClinicalForm,
  ClinicalFormFormData,
  ClinicalFormQueryParams,
  PaginatedResponse,
  FormTypeOption,
} from "../types";

/**
 * Servicio para gestionar formularios clínicos
 */
export const clinicalFormsService = {
  /**
   * Obtener todos los formularios con paginación y filtros
   */
  getAll: async (
    params?: ClinicalFormQueryParams
  ): Promise<PaginatedResponse<ClinicalForm>> => {
    const response = await apiService.get<PaginatedResponse<ClinicalForm>>(
      "/clinical-records/forms/",
      { params }
    );
    return response.data;
  },

  /**
   * Obtener formulario por ID
   */
  getById: async (id: string): Promise<ClinicalForm> => {
    const response = await apiService.get<ClinicalForm>(
      `/clinical-records/forms/${id}/`
    );
    return response.data;
  },

  /**
   * Obtener formularios de una historia clínica específica
   */
  getByRecord: async (clinicalRecordId: string): Promise<ClinicalForm[]> => {
    const response = await apiService.get<ClinicalForm[]>(
      "/clinical-records/forms/by_record/",
      {
        params: { clinical_record_id: clinicalRecordId },
      }
    );
    return response.data;
  },

  /**
   * Obtener formularios por tipo
   */
  getByType: async (formType: string): Promise<ClinicalForm[]> => {
    const response = await apiService.get<ClinicalForm[]>(
      "/clinical-records/forms/by_type/",
      {
        params: { form_type: formType },
      }
    );
    return response.data;
  },

  /**
   * Obtener tipos de formularios disponibles
   */
  getFormTypes: async (): Promise<FormTypeOption[]> => {
    const response = await apiService.get<{ form_types: FormTypeOption[] }>(
      "/clinical-records/forms/form_types/"
    );
    return response.data.form_types;
  },

  /**
   * Crear nuevo formulario
   */
  create: async (data: ClinicalFormFormData): Promise<ClinicalForm> => {
    const response = await apiService.post<ClinicalForm>(
      "/clinical-records/forms/",
      data
    );
    return response.data;
  },

  /**
   * Actualizar formulario existente
   */
  update: async (
    id: string,
    data: Partial<ClinicalFormFormData>
  ): Promise<ClinicalForm> => {
    const response = await apiService.put<ClinicalForm>(
      `/clinical-records/forms/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Eliminar formulario
   */
  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/clinical-records/forms/${id}/`);
  },
};
