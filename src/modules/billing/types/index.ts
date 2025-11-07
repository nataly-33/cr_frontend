export type SubscriptionPlanType = "basic" | "professional" | "enterprise";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";
export type InvoiceStatus = "draft" | "issued" | "sent" | "paid" | "overdue" | "cancelled";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  plan_type: SubscriptionPlanType;
  description: string;
  monthly_price: number;
  annual_price: number;
  max_users: number;
  max_patients: number;
  storage_gb: number;
  features: string[];
  is_active: boolean;
}

export interface Payment {
  id: string;
  subscription_plan: string;
  subscription_plan_name: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  status_display: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  metadata?: Record<string, any>;
  error_message?: string;
  retry_count?: number;
}

export interface Invoice {
  id: string;
  payment?: string;
  subscription_plan: string;
  subscription_plan_name: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  description?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
  status: InvoiceStatus;
  status_display: string;
  issue_date: string;
  due_date?: string;
  paid_at?: string;
  payment_status?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}
