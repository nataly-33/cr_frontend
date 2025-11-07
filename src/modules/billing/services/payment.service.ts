import { apiService } from "@shared/services/api.service";
import type { PaginatedResponse } from "@core/types";
import type {
  SubscriptionPlan,
  Payment,
  Invoice,
  CheckoutSessionResponse,
} from "../types";

export type { SubscriptionPlan, Payment, Invoice, CheckoutSessionResponse };

const BASE_URL = "/payments";

export const paymentService = {
  // Planes de suscripción (protegido)
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiService.get<SubscriptionPlan[]>(
      "/tenants/subscription-plans/"
    );
    return response.data;
  },

  // Pagos
  getPayments: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    const response = await apiService.get<PaginatedResponse<Payment>>(
      `${BASE_URL}/`,
      { params }
    );
    return response.data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await apiService.get<Payment>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  // Checkout con Stripe
  createCheckoutSession: async (planId: string): Promise<CheckoutSessionResponse> => {
    const response = await apiService.post<CheckoutSessionResponse>(
      `${BASE_URL}/checkout/`,
      { plan_id: planId }
    );
    return response.data;
  },

  // Facturas
  getInvoices: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiService.get<PaginatedResponse<Invoice>>(
      `${BASE_URL}/invoices/`,
      { params }
    );
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiService.get<Invoice>(
      `${BASE_URL}/invoices/${id}/`
    );
    return response.data;
  },
};
