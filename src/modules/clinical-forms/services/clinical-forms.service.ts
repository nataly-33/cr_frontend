import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
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
      ENDPOINTS.CLINICAL_RECORDS.FORMS,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener formulario por ID
   */
  getById: async (id: string): Promise<ClinicalForm> => {
    const response = await apiService.get<ClinicalForm>(
      ENDPOINTS.CLINICAL_RECORDS.FORMS_DETAIL(id)
    );
    return response.data;
  },

  /**
   * Obtener formularios de una historia clínica específica
   */
  getByRecord: async (clinicalRecordId: string): Promise<ClinicalForm[]> => {
    const response = await apiService.get<ClinicalForm[]>(
      ENDPOINTS.CLINICAL_RECORDS.FORMS_BY_RECORD(clinicalRecordId)
    );
    return response.data;
  },

  /**
   * Obtener formularios por tipo
   */
  getByType: async (formType: string): Promise<ClinicalForm[]> => {
    const response = await apiService.get<ClinicalForm[]>(
      ENDPOINTS.CLINICAL_RECORDS.FORMS_BY_TYPE(formType)
    );
    return response.data;
  },

  /**
   * Obtener tipos de formularios disponibles
   */
  getFormTypes: async (): Promise<FormTypeOption[]> => {
    const response = await apiService.get<{ form_types: FormTypeOption[] }>(
      ENDPOINTS.CLINICAL_RECORDS.FORMS_TYPES
    );
    return response.data.form_types;
  },

  /**
   * Crear nuevo formulario
   */
  create: async (data: ClinicalFormFormData): Promise<ClinicalForm> => {
    const response = await apiService.post<ClinicalForm>(
      ENDPOINTS.CLINICAL_RECORDS.FORMS,
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
      ENDPOINTS.CLINICAL_RECORDS.FORMS_DETAIL(id),
      data
    );
    return response.data;
  },

  /**
   * Eliminar formulario
   */
  delete: async (id: string): Promise<void> => {
    await apiService.delete(ENDPOINTS.CLINICAL_RECORDS.FORMS_DETAIL(id));
  },
};
