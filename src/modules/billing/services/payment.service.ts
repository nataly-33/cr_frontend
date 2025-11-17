import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type { PaginatedResponse } from "@core/types";
import type {
  SubscriptionPlan,
  Payment,
  Invoice,
  CheckoutSessionResponse,
} from "../types";

export type { SubscriptionPlan, Payment, Invoice, CheckoutSessionResponse };

export const paymentService = {
  // Planes de suscripción (protegido)
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiService.get<SubscriptionPlan[]>(
      ENDPOINTS.TENANTS.SUBSCRIPTION_PLANS
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
      ENDPOINTS.PAYMENTS.LIST,
      { params }
    );
    return response.data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await apiService.get<Payment>(
      ENDPOINTS.PAYMENTS.DETAIL(id)
    );
    return response.data;
  },

  // Checkout con Stripe
  createCheckoutSession: async (
    planId: string
  ): Promise<CheckoutSessionResponse> => {
    const response = await apiService.post<CheckoutSessionResponse>(
      ENDPOINTS.PAYMENTS.CHECKOUT,
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
      ENDPOINTS.PAYMENTS.INVOICES.LIST,
      { params }
    );
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiService.get<Invoice>(
      ENDPOINTS.PAYMENTS.INVOICES.DETAIL(id)
    );
    return response.data;
  },
};
