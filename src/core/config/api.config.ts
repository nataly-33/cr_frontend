export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/login/",
    LOGOUT: "/logout/",
    REFRESH: "/refresh/",
    ME: "/users/me/",
  },
  PATIENTS: {
    LIST: "/patients/",
    DETAIL: (id: string) => `/patients/${id}/`,
    CREATE: "/patients/",
  },
  CLINICAL_RECORDS: {
    LIST: "/clinical-records/",
    DETAIL: (id: string) => `/clinical-records/${id}/`,
    CREATE: "/clinical-records/",
  },
  DOCUMENTS: {
    LIST: "/documents/",
    DETAIL: (id: string) => `/documents/${id}/`,
    UPLOAD: "/documents/upload/",
  },
  AUDIT: {
    LIST: "/audit/",
    DETAIL: (id: string) => `/audit/${id}/`,
  },
  REPORTS: {
    GENERATE: "/reports/generator/generate/",
    LIST: "/reports/executions/",
    DETAIL: (id: string) => `/reports/executions/${id}/`,
    DOWNLOAD: (id: string) => `/reports/executions/${id}/download/`,
    ANALYZE: (id: string) => `/reports/executions/${id}/analyze/`,
    SUMMARIZE: (id: string) => `/reports/executions/${id}/summarize/`,
    RECOMMENDATIONS: (id: string) => `/reports/executions/${id}/recommendations/`,
    AI_INSIGHTS: (id: string) => `/reports/executions/${id}/ai-insights/`,
  },
  SEED: {
    GENERATE: "/seed/generate/",
    LIST: "/seed/list/",
  },
};
