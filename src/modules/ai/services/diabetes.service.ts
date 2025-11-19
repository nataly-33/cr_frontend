import { apiService } from '@shared/services/api.service';
import { API_CONFIG } from '@core/config/api.config';
import type {
  PredictResponse,
  ModelInfoResponse,
  PredictionHistoryResponse,
  DiabetesPrediction,
  TreeRulesResponse
} from '../types';

const BASE_URL = '/ai/diabetes';

export const diabetesService = {
  /**
   * Realiza una predicción de diabetes para un paciente
   */
  predict: async (patientId: string): Promise<PredictResponse> => {
    const response = await apiService.post<PredictResponse>(
      `${BASE_URL}/predict/`,
      { patient_id: patientId }
    );
    return response.data;
  },

  /**
   * Obtiene el historial de predicciones de un paciente
   */
  getPatientHistory: async (patientId: string): Promise<PredictionHistoryResponse> => {
    const response = await apiService.get<PredictionHistoryResponse>(
      `${BASE_URL}/patient/${patientId}/`
    );
    return response.data;
  },

  /**
   * Obtiene información del modelo activo
   */
  getModelInfo: async (): Promise<ModelInfoResponse> => {
    const response = await apiService.get<ModelInfoResponse>(
      `${BASE_URL}/model/info/`
    );
    return response.data;
  },

  /**
   * Obtiene todas las predicciones
   */
  getAllPredictions: async (): Promise<DiabetesPrediction[]> => {
    const response = await apiService.get<DiabetesPrediction[]>(`${BASE_URL}/`);
    return response.data;
  },

  /**
   * Obtiene una predicción específica por ID
   */
  getPredictionById: async (id: string): Promise<DiabetesPrediction> => {
    const response = await apiService.get<DiabetesPrediction>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Obtiene la URL de la visualización del árbol de decisión
   */
  getTreeVisualizationUrl: (): string => {
    return `${API_CONFIG.BASE_URL}${BASE_URL}/tree/visualization/`;
  },

  /**
   * Obtiene las reglas del árbol de decisión
   */
  getTreeRules: async (): Promise<TreeRulesResponse> => {
    const response = await apiService.get<TreeRulesResponse>(
      `${BASE_URL}/tree/rules/`
    );
    return response.data;
  },

  /**
   * Obtiene la URL del gráfico de importancia de características
   */
  getFeatureImportanceUrl: (): string => {
    return `${API_CONFIG.BASE_URL}${BASE_URL}/tree/feature-importance/`;
  }
};
