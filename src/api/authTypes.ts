// ─── Request ────────────────────────────────────────────────────────────────

export type LoginPayload = {
  email: string;
  password: string;
  device_push_token?: string | null;
};

// ─── Response ────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string;
  phone?: string;
  name: string;
  profile?: string;
  active_status?: boolean;
};

export type StoreTimingSlot = {
  open: string;
  close: string;
};

export type StoreDayTiming = {
  slots: StoreTimingSlot[];
  is_active: boolean;
};

export type StoreTimings = {
  monday?: StoreDayTiming;
  tuesday?: StoreDayTiming;
  wednesday?: StoreDayTiming;
  thursday?: StoreDayTiming;
  friday?: StoreDayTiming;
  saturday?: StoreDayTiming;
  sunday?: StoreDayTiming;
};

export type StoreProfile = {
  id: string;
  address: string;
  deliveryTime: string | null;
  minimumOrder: string;
  salesTax: string;
  deliveryRadiusKm: string;
  tag_line: string | null;
  description: string | null;
  status: string;
  rejection_reason: string | null;
  cuisines: string | null;
  storeImage: string;
  coverImage: string;
  linked_vendor_id: string;
  user_profile_id: string;
  latitude: number | null;
  longitude: number | null;
  keywords: string | null;
  fcm_token: string | null;
  prepare_time: string;
  base_fee: number;
  per_km_fee: number;
  free_delivery_threashold: number;
  packing_charges: number;
  business_liscence: string;
  business_liscence_back: string;
  national_id_front: string;
  national_id_back: string;
  registered_store_docs: string;
  tax_id_certificate: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  branch_code: string;
  allow_schedule_booking: boolean;
  pickup_allow: boolean;
  delivery_allow: boolean;
  card_payment: boolean;
  cod_allow: boolean;
  show_contact_on_store_page: boolean;
  change_password_allowed: boolean;
  notes: string | null;
  shop_type_id: string;
  zone_id: string;
  storeType: string;
  chainId: string | null;
  total_orders: number;
  storeTimings: StoreTimings;
  store_available: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfileEntry = {
  key: 'Store' | string;
  data: StoreProfile;
};

export type AuthSessionResponse = {
  accessToken: string;
  refreshToken?: string | null;
  user: AuthUser;
  profiles?: ProfileEntry[];
};
