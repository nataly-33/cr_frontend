import { apiService } from "@shared/services/api.service";
import { ENDPOINTS, API_CONFIG } from "@core/config/api.config";
import type {
  PredictResponse,
  ModelInfoResponse,
  PredictionHistoryResponse,
  DiabetesPrediction,
  TreeRulesResponse,
} from "../types";

export const diabetesService = {
  /**
   * Realiza una predicción de diabetes para un paciente
   */
  predict: async (patientId: string): Promise<PredictResponse> => {
    const response = await apiService.post<PredictResponse>(
      ENDPOINTS.AI.DIABETES.PREDICT,
      { patient_id: patientId }
    );
    return response.data;
  },

  /**
   * Obtiene el historial de predicciones de un paciente
   */
  getPatientHistory: async (
    patientId: string
  ): Promise<PredictionHistoryResponse> => {
    const response = await apiService.get<PredictionHistoryResponse>(
      ENDPOINTS.AI.DIABETES.PATIENT_HISTORY(patientId)
    );
    return response.data;
  },

  /**
   * Obtiene información del modelo activo
   */
  getModelInfo: async (): Promise<ModelInfoResponse> => {
    const response = await apiService.get<ModelInfoResponse>(
      ENDPOINTS.AI.DIABETES.MODEL_INFO
    );
    return response.data;
  },

  /**
   * Obtiene todas las predicciones
   */
  getAllPredictions: async (): Promise<DiabetesPrediction[]> => {
    const response = await apiService.get<DiabetesPrediction[]>(
      ENDPOINTS.AI.DIABETES.LIST
    );
    return response.data;
  },

  /**
   * Obtiene una predicción específica por ID
   */
  getPredictionById: async (id: string): Promise<DiabetesPrediction> => {
    const response = await apiService.get<DiabetesPrediction>(
      ENDPOINTS.AI.DIABETES.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Obtiene la URL de la visualización del árbol de decisión
   */
  getTreeVisualizationUrl: (): string => {
    return `${API_CONFIG.BASE_URL}${ENDPOINTS.AI.DIABETES.TREE_VISUALIZATION}`;
  },

  /**
   * Obtiene las reglas del árbol de decisión
   */
  getTreeRules: async (): Promise<TreeRulesResponse> => {
    const response = await apiService.get<TreeRulesResponse>(
      ENDPOINTS.AI.DIABETES.TREE_RULES
    );
    return response.data;
  },

  /**
   * Obtiene la URL del gráfico de importancia de características
   */
  getFeatureImportanceUrl: (): string => {
    return `${API_CONFIG.BASE_URL}${ENDPOINTS.AI.DIABETES.FEATURE_IMPORTANCE}`;
  },
};
