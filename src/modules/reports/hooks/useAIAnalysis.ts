import { useState, useCallback } from 'react';
import type { AIInsightsResponse } from '../types';

import { reportsService } from '../services/reports.service';

interface UseAIAnalysisState {
  insights: AIInsightsResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAIAnalysisReturn extends UseAIAnalysisState {
  analyzeReport: (reportId: string) => Promise<void>;
  generateSummary: (reportId: string, maxLength?: number) => Promise<void>;
  getRecommendations: (reportId: string) => Promise<void>;
  getFullInsights: (reportId: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for AI analysis operations
 * Handles state management and API calls for AI features
 */
export const useAIAnalysis = (): UseAIAnalysisReturn => {
  const [state, setState] = useState<UseAIAnalysisState>({
    insights: null,
    isLoading: false,
    error: null,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  /**
   * Analyze a report with AI
   */
  const analyzeReport = useCallback(
    async (reportId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportsService.analyzeWithAI(reportId);
        setState((prev) => ({
          ...prev,
          insights: prev.insights
            ? { ...prev.insights, analysis: result }
            : ({ analysis: result } as AIInsightsResponse),
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to analyze report';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Generate a summary for a report
   */
  const generateSummary = useCallback(
    async (reportId: string, maxLength?: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportsService.generateSummary(reportId, maxLength);
        setState((prev) => ({
          ...prev,
          insights: prev.insights
            ? { ...prev.insights, summary: result }
            : ({ summary: result } as AIInsightsResponse),
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate summary';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Get recommendations for a report
   */
  const getRecommendations = useCallback(
    async (reportId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportsService.getRecommendations(reportId);
        setState((prev) => ({
          ...prev,
          insights: prev.insights
            ? { ...prev.insights, recommendations: result }
            : ({ recommendations: result } as AIInsightsResponse),
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get recommendations';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Get all insights at once (analysis + summary + recommendations)
   */
  const getFullInsights = useCallback(
    async (reportId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportsService.getAIInsights(reportId);
        setState((prev) => ({ ...prev, insights: result }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get insights';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setState({
      insights: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    analyzeReport,
    generateSummary,
    getRecommendations,
    getFullInsights,
    reset,
  };
};

export default useAIAnalysis;
