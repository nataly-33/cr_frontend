/**
 * Servicio de API para Reports AI
 * Maneja comunicación con el backend para reportes con lenguaje natural
 */
import { apiService } from "@shared/services/api.service";

export interface ParseQueryRequest {
  query_text: string;
  language?: "es" | "en";
  input_method?: "text" | "voice";
  ai_provider?: "openai" | "local";
}

export interface ParseQueryResponse {
  query_id: string;
  sql: string;
  params: Record<string, any>;
  confidence: number;
  table_name: string;
  explanation: string;
  estimated_rows?: number;
}

export interface ExecuteQueryRequest {
  query_id: string;
  output_format?: "json" | "csv" | "excel" | "pdf";
  row_limit?: number;
  override_sql?: string;
}

export interface ExecuteQueryResponse {
  execution_id: string;
  status: string;
  result_count: number;
  execution_time_ms: number;
  columns: string[];
  data: Record<string, any>[];
  truncated: boolean;
  download_url?: string;
}

export interface DirectQueryRequest {
  query_text: string;
  language?: "es" | "en";
  output_format?: "json" | "csv" | "excel" | "pdf";
  row_limit?: number;
  ai_provider?: "openai" | "local";
}

export interface QueryHistory {
  query_id: string;
  query_text: string;
  created_at: string;
  status: string;
  confidence: number;
  executions_count: number;
  last_execution: string | null;
}

export interface QueryStats {
  total_queries: number;
  total_executions: number;
  avg_confidence: number;
  avg_execution_time_ms: number;
  successful_queries: number;
  failed_queries: number;
  top_tables: any[];
  queries_by_day: { date: string; count: number }[];
}

class ReportsAIService {
  private baseURL = "/reports-ai";

  /**
   * Parsear consulta en lenguaje natural a SQL
   */
  async parseQuery(data: ParseQueryRequest): Promise<ParseQueryResponse> {
    const response = await apiService.post<ParseQueryResponse>(
      `${this.baseURL}/parse/`,
      data
    );
    return response.data;
  }

  /**
   * Ejecutar consulta parseada
   */
  async executeQuery(data: ExecuteQueryRequest): Promise<ExecuteQueryResponse> {
    const response = await apiService.post<ExecuteQueryResponse>(
      `${this.baseURL}/execute/`,
      data
    );
    return response.data;
  }

  /**
   * Parsear y ejecutar en un solo paso
   */
  async directQuery(data: DirectQueryRequest): Promise<ExecuteQueryResponse> {
    const response = await apiService.post<ExecuteQueryResponse>(
      `${this.baseURL}/direct/`,
      data
    );
    return response.data;
  }

  /**
   * Obtener historial de consultas
   */
  async getHistory(limit: number = 50): Promise<QueryHistory[]> {
    const response = await apiService.get<QueryHistory[]>(
      `${this.baseURL}/history/`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  /**
   * Obtener estadísticas
   */
  async getStats(): Promise<QueryStats> {
    const response = await apiService.get<QueryStats>(`${this.baseURL}/stats/`);
    return response.data;
  }

  /**
   * Descargar resultado de ejecución
   */
  async downloadExecution(executionId: string): Promise<Blob> {
    const response = await apiService.get<Blob>(
      `${this.baseURL}/${executionId}/download/`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  /**
   * Descargar por URL directa
   * Construye la URL completa sin pasar por apiService (para evitar /api/ en media URLs)
   */
  downloadByUrl(url: string) {
    // Si la URL es relativa a /media/, construir la URL completa sin /api/
    if (url.startsWith("/media/")) {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      // Remover /api de la URL si está presente
      const baseUrlWithoutApi = baseUrl.replace(/\/api$/, "");
      const fullUrl = `${baseUrlWithoutApi}${url}`;
      window.open(fullUrl, "_blank");
    } else {
      // Para otras URLs, usar la URL tal cual
      const fullUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }${url}`;
      window.open(fullUrl, "_blank");
    }
  }
}

export const reportsAIService = new ReportsAIService();
export default reportsAIService;
