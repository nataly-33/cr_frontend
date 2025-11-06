import axios from "axios";
import type {
  SubscriptionPlan,
  TenantRegistrationRequest,
  TenantRegistrationResponse,
  TenantActivationRequest,
  TenantActivationResponse,
} from "../types/index";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Instancia de axios SIN autenticación para APIs públicas
const publicApi = axios.create({
  baseURL: `${API_URL}/tenants/public`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicApiService = {
  // Obtener planes disponibles
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await publicApi.get<{ results: SubscriptionPlan[] }>("/plans/");
    // Django REST Framework devuelve {results: [...]} cuando usa paginación
    return response.data.results || response.data;
  },

  // Registrar nuevo tenant
  async registerTenant(
    data: TenantRegistrationRequest
  ): Promise<TenantRegistrationResponse> {
    const response = await publicApi.post<TenantRegistrationResponse>(
      "/register/",
      data
    );
    return response.data;
  },

  // Simular pago (desarrollo)
  async simulatePayment(
    registrationId: number
  ): Promise<{ status: string; message: string }> {
    const response = await publicApi.post(
      `/registrations/${registrationId}/simulate-payment/`
    );
    return response.data;
  },

  // Activar tenant con nueva contraseña
  async activateTenant(
    data: TenantActivationRequest
  ): Promise<TenantActivationResponse> {
    const response = await publicApi.post<TenantActivationResponse>(
      "/activate/",
      data
    );
    return response.data;
  },

  // Verificar disponibilidad de subdominio
  async checkSubdomainAvailability(
    subdomain: string
  ): Promise<{ available: boolean }> {
    const response = await publicApi.get(
      `/check-subdomain/?subdomain=${subdomain}`
    );
    return response.data;
  },
};
