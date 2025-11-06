import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

import { API_CONFIG } from "@core/config/api.config";

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refresh_token");
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}/auth/refresh/`,
              { refresh: refreshToken }
            );

            const { access } = response.data;
            localStorage.setItem("access_token", access);

            originalRequest.headers.Authorization = `Bearer ${access}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export const apiService = new ApiService();
