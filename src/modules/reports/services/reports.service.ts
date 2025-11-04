import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type {
  ReportTemplate,
  ReportExecution,
  GenerateReportData,
  AIInsightsResponse,
  AIAnalysisResult,
  AISummary,
  AIRecommendation,
} from "../types";
import type { PaginatedResponse } from "@core/types";

interface GetExecutionsParams {
  page?: number;
  page_size?: number;
  report_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  ordering?: string;
}

export const reportsService = {
  /**
   * Get all report templates
   */
  getTemplates: async (): Promise<ReportTemplate[]> => {
    const response = await apiService.get<ReportTemplate[]>(
      "/reports/templates/"
    );
    return response.data;
  },

  /**
   * Get template by ID
   */
  getTemplateById: async (id: string): Promise<ReportTemplate> => {
    const response = await apiService.get<ReportTemplate>(
      `/reports/templates/${id}/`
    );
    return response.data;
  },

  /**
   * Create report template
   */
  createTemplate: async (
    data: Partial<ReportTemplate>
  ): Promise<ReportTemplate> => {
    const response = await apiService.post<ReportTemplate>(
      "/reports/templates/",
      data
    );
    return response.data;
  },

  /**
   * Update report template
   */
  updateTemplate: async (
    id: string,
    data: Partial<ReportTemplate>
  ): Promise<ReportTemplate> => {
    const response = await apiService.put<ReportTemplate>(
      `/reports/templates/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Delete report template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    await apiService.delete(`/reports/templates/${id}/`);
  },

  /**
   * Get all report executions with pagination and filters
   */
  getExecutions: async (
    params?: GetExecutionsParams
  ): Promise<PaginatedResponse<ReportExecution>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.report_type)
      queryParams.append("report_type", params.report_type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.start_date)
      queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const response = await apiService.get<PaginatedResponse<ReportExecution>>(
      `/reports/executions/?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get execution by ID
   */
  getExecutionById: async (id: string): Promise<ReportExecution> => {
    const response = await apiService.get<ReportExecution>(
      `/reports/executions/${id}/`
    );
    return response.data;
  },

  /**
   * Generate new report
   */
  generate: async (data: GenerateReportData): Promise<ReportExecution> => {
    const response = await apiService.post<ReportExecution>(
      ENDPOINTS.REPORTS.GENERATE,
      data
    );
    return response.data;
  },

  /**
   * Download report file
   */
  download: async (id: string): Promise<Blob> => {
    const response = await apiService.get<Blob>(
      ENDPOINTS.REPORTS.DOWNLOAD(id),
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  /**
   * Download report file and trigger browser download
   */
  downloadFile: async (
    id: string,
    filename: string
  ): Promise<void> => {
    const blob = await reportsService.download(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Cancel report execution
   */
  cancel: async (id: string): Promise<ReportExecution> => {
    const response = await apiService.post<ReportExecution>(
      `/reports/executions/${id}/cancel/`
    );
    return response.data;
  },

  /**
   * Delete report execution
   */
  deleteExecution: async (id: string): Promise<void> => {
    await apiService.delete(`/reports/executions/${id}/`);
  },

  /**
   * Get report statistics
   */
  getStatistics: async (): Promise<{
    total_executions: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    recent_executions: ReportExecution[];
  }> => {
    const response = await apiService.get<{
      total_executions: number;
      by_type: Record<string, number>;
      by_status: Record<string, number>;
      recent_executions: ReportExecution[];
    }>("/reports/statistics/");
    return response.data;
  },

  // ====== AI/IA Analysis Methods ======

  /**
   * Analyze report data with AI
   */
  analyzeWithAI: async (reportId: string): Promise<AIAnalysisResult> => {
    const response = await apiService.post<AIAnalysisResult>(
      `/reports/executions/${reportId}/analyze/`
    );
    return response.data;
  },

  /**
   * Generate AI summary for report
   */
  generateSummary: async (reportId: string, maxLength?: number): Promise<AISummary> => {
    const params = maxLength ? `?max_length=${maxLength}` : "";
    const response = await apiService.post<AISummary>(
      `/reports/executions/${reportId}/summarize/${params}`
    );
    return response.data;
  },

  /**
   * Get AI recommendations based on report
   */
  getRecommendations: async (reportId: string): Promise<AIRecommendation[]> => {
    const response = await apiService.get<AIRecommendation[]>(
      `/reports/executions/${reportId}/recommendations/`
    );
    return response.data;
  },

  /**
   * Get all AI insights for a report (analysis + summary + recommendations)
   */
  getAIInsights: async (reportId: string): Promise<AIInsightsResponse> => {
    const response = await apiService.get<AIInsightsResponse>(
      `/reports/executions/${reportId}/ai-insights/`
    );
    return response.data;
  },

  /**
   * Get AI insights with caching - checks if already analyzed
   */
  getOrAnalyzeReport: async (reportId: string): Promise<AIInsightsResponse> => {
    try {
      // First try to get cached insights
      return await reportsService.getAIInsights(reportId);
    } catch (error) {
      // If not available, trigger analysis
      await reportsService.analyzeWithAI(reportId);
      // Return pending response
      return {
        status: "pending",
        message: "Analysis started, please check back in a moment",
      };
    }
  },
};
