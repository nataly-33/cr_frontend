export interface DiabetesPredictionModel {
  id: string;
  version: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  is_active: boolean;
  created_at: string;
}

export interface ContributingFactor {
  factor: string;
  value: string;
  normal?: string;
  importance?: number;
}

export interface Recommendation {
  category: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  action?: string;
}

export interface DiabetesPrediction {
  id: string;
  patient: string;
  patient_name: string;
  model: string;
  model_version: string;
  has_diabetes_risk: boolean;
  probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  input_features: Record<string, number>;
  contributing_factors: ContributingFactor[];
  feature_importance: Record<string, number>;
  recommendations: Recommendation[];
  predicted_by: string | null;
  tenant: string;
  notes: string;
  created_at: string;
}

export interface PredictRequest {
  patient_id: string;
}

export interface PredictResponse {
  success: boolean;
  message?: string;
  data: DiabetesPrediction;
  error?: string;
}

export interface ModelInfoResponse {
  success: boolean;
  data: DiabetesPredictionModel;
}

export interface PredictionHistoryResponse {
  success: boolean;
  count: number;
  data: DiabetesPrediction[];
}

export interface TreeRule {
  conditions: string[];
  prediction: string;
  samples: number;
  confidence: number;
  depth: number;
}

export interface TreeRulesResponse {
  success: boolean;
  data: {
    model_version: string;
    accuracy: number;
    tree_depth: number;
    n_leaves: number;
    rules_text: string;
    interpretable_rules: TreeRule[];
  };
}
