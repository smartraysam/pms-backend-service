type Gender = "MALE" | "FEMALE";

export type ProviderPaginatedResponse<T = unknown> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: string | number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

export interface Fleet {
  id: number;
  name: string;
  email: string;
  company: string;
  mobile: string;
  logo: string | null;
  commission: number;
  wallet_balance: number;
  stripe_cust_id: string | null;
  language: string | null;
  status: number;
  wallet_status: number;
  gender: Gender;
  created_at: string;
  updated_at: string;
}

export interface ServiceType {
  id: number;
  name: string;
  provider_name: string;
  image: string;
  marker: string;
  capacity: number;
  fixed: number;
  price: number;
  minute: number;
  hour: number;
  distance: number;
  calculator: string;
  description: string | null;
  waiting_free_mins: number;
  waiting_min_charge: number;
  status: number;
}

export interface Service {
  id: number;
  provider_id: number;
  service_type_id: number;
  status: string;
  service_number: string;
  service_model: string;
  service_type: ServiceType;
}

export interface ProviderListDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  country_code: string;
  mobile: string;
  avatar: string | null;
  rating: string;
  status: string;
  fleet: number;
  latitude: number;
  longitude: number;
  stripe_acc_id: string | null;
  stripe_cust_id: string | null;
  paypal_email: string | null;
  login_by: string;
  social_unique_id: string | null;
  otp: number;
  wallet_balance: number;
  wallet: number;
  referral_unique_id: string | null;
  qrcode_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  fleets: Fleet;
  service: Service;
}
