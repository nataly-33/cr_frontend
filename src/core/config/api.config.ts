export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/refresh/",
    ME: "/users/me/",
  },
  PATIENTS: {
    LIST: "/patients/",
    DETAIL: (id: string) => `/patients/${id}/`,
    CREATE: "/patients/",
  },
  DOCUMENTS: {
    LIST: "/documents/",
    DETAIL: (id: string) => `/documents/${id}/`,
    UPLOAD: "/documents/upload/",
  },
  REPORTS: {
    GENERATE: "/reports/generator/generate/",
    LIST: "/reports/executions/",
  },
};
