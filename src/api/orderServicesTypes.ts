// ──────────────────────────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────────────────────────

export enum OrderStatus {
  SCHEDULED = "scheduled",
  PENDING = "pending",
  ACCEPTED = "accepted",
  PREPARING = "preparing",
  READY = "ready",
  RIDER_ASSIGNED = "rider_assigned",
  PICKED_UP = "picked_up",
  OUT_FOR_DELIVERY = "out_for_delivery",
  ARRIVED = "arrived",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
  FAILED = "failed",
}

export type OrderType = "delivery" | "pickup";

// ──────────────────────────────────────────────────────────────────
// Common Request Parameters
// ──────────────────────────────────────────────────────────────────

export type GetOrdersParams = {
  offset?: number;
  limit?: number;
  search?: string;
  orderType?: OrderType | "all";
};

// ──────────────────────────────────────────────────────────────────
// Order Item (same for all endpoints)
// ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  name: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions: unknown;
}

export interface OrderSummary {
  orderNumber: string | null;
  itemSubtotal: number | null;
  discountAmount: number | null;
  taxAmount: number | null;
  packingCharges: number | null;
  deliveryFee: number | null;
  courierTip: number | null;
  totalAmount: number | null;
  note: string | null;
}

// ──────────────────────────────────────────────────────────────────
// Order (unified for all statuses)
// ──────────────────────────────────────────────────────────────────

export interface Order {
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  statusLabel: string; // e.g. "New Order", "In Progress", "Ready", "Pickup", "Completed"
  orderType: OrderType;
  customerName: string;
  customerProfileImage: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  pickupAddress: string | null;
  orderAmount: number;
  orderSummary?: OrderSummary | null;
  itemCount: number;
  items: OrderItem[];
  customerComment: string | null;
  restaurantNote: string | null;
  preparingTimeInMinutes: number | null;
  preparationStartedAt: string | null;
  remainingSeconds?: number;
  riderName: string | null;
  riderId?: string | null;
  riderPhone: string | null;
  riderVehicle: string | null;
  riderVehicleDetails?: {
    name?: string | null;
    colour?: string | null;
    vehicleNo?: string | null;
    vehicle_name?: string | null;
    vehicle_colour?: string | null;
    vehicle_no?: string | null;
  } | null;
  riderArrived: boolean;
  riderStatus: string | null;
  riderStatusLabel: string | null;
  createdAt: string;
  canAccept: boolean;
  canReject: boolean;
}

// ──────────────────────────────────────────────────────────────────
// Paginated response (generic for all GET endpoints)
// ──────────────────────────────────────────────────────────────────

export interface PaginatedOrdersResponse {
  items: Order[];
  offset: number;
  limit: number;
  total: number;
  isEnd: boolean;
  nextOffset: number | null;
}

// ──────────────────────────────────────────────────────────────────
// Mutation request/response types
// ──────────────────────────────────────────────────────────────────

export type AcceptOrderResponse = {
  message: string;
  orderId: string;
  status: OrderStatus.ACCEPTED;
};

export type RejectOrderResponse = {
  message: string;
  orderId: string;
  status: OrderStatus.REJECTED;
};

export type RejectOrderRequest = {
  reason: string;
};

export type UpdateOrderStatusRequest = {
  status: Exclude<
    OrderStatus,
    OrderStatus.CANCELLED | OrderStatus.REJECTED | OrderStatus.FAILED
  >;
};

export type UpdateOrderStatusResponse = {
  message: string;
  orderId: string;
  status: OrderStatus;
};

export type UpdatePreparingTimeRequest = {
  preparingTimeInMinutes: number;
};

export type UpdatePreparingTimeResponse = {
  message: string;
  orderId: string;
  status: OrderStatus.PREPARING;
  preparingTimeInMinutes: number;
};
