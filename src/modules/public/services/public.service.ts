import axios from "axios";
import { ENDPOINTS } from "@core/config/api.config";
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
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicApiService = {
  // Obtener planes disponibles
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await publicApi.get<{ results: SubscriptionPlan[] }>(
      ENDPOINTS.TENANTS.PUBLIC.PLANS
    );
    // Django REST Framework devuelve {results: [...]} cuando usa paginación
    return response.data.results || response.data;
  },

  // Registrar nuevo tenant
  async registerTenant(
    data: TenantRegistrationRequest
  ): Promise<TenantRegistrationResponse> {
    const response = await publicApi.post<TenantRegistrationResponse>(
      ENDPOINTS.TENANTS.PUBLIC.REGISTER,
      data
    );
    return response.data;
  },

  // Simular pago (desarrollo)
  async simulatePayment(
    registrationId: number
  ): Promise<{ status: string; message: string }> {
    const response = await publicApi.post(
      ENDPOINTS.TENANTS.PUBLIC.SIMULATE_PAYMENT(registrationId)
    );
    return response.data;
  },

  // Activar tenant con nueva contraseña
  async activateTenant(
    data: TenantActivationRequest
  ): Promise<TenantActivationResponse> {
    const response = await publicApi.post<TenantActivationResponse>(
      ENDPOINTS.TENANTS.PUBLIC.ACTIVATE,
      data
    );
    return response.data;
  },

  // Verificar disponibilidad de subdominio
  async checkSubdomainAvailability(
    subdomain: string
  ): Promise<{ available: boolean }> {
    const response = await publicApi.get(
      ENDPOINTS.TENANTS.PUBLIC.CHECK_SUBDOMAIN(subdomain)
    );
    return response.data;
  },

  // Crear sesión de Stripe Checkout para registro público
  async createCheckoutSession(data: {
    registration_id: number;
    plan_id: number;
    billing_cycle: "monthly" | "annual";
    tenant_name: string;
    admin_email: string;
  }): Promise<{ checkout_url: string; session_id: string }> {
    const response = await publicApi.post<{
      checkout_url: string;
      session_id: string;
    }>(ENDPOINTS.TENANTS.PUBLIC.CHECKOUT, data);
    return response.data;
  },
};
