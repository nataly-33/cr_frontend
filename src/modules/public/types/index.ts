export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  plan_type: "basic" | "professional" | "enterprise";
  description: string;
  monthly_price: string;
  annual_price: string;
  max_users: number;
  max_patients: number;
  storage_gb: number;
  features: string[];
  is_active: boolean;
}

export interface TenantRegistrationRequest {
  tenant_name: string;
  subdomain: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_phone?: string;
  plan_id: number;
  billing_cycle: "monthly" | "annual";
}

export interface TenantRegistrationResponse {
  registration_id: number;
  status: string;
  payment_amount: number;
  message: string;
}

export interface TenantActivationRequest {
  activation_token: string;
  new_password: string;
}

export interface TenantActivationResponse {
  status: string;
  tenant_name: string;
  login_url: string;
  message: string;
}
