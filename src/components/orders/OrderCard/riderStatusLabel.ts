import { OrderStatus } from "../../../api/orderServicesTypes";

const RIDER_STATUS_LABELS: Record<string, string> = {
  heading_to_store: "Heading to Store",
  arrived_at_store: "Arrived at Store",
  waiting_for_order: "Waiting for Order",
  picked_up: "Picked Up",
  out_for_delivery: "Heading to Customer",
  arrived: "Arrived at Customer",
};

export function getReadableRiderStatus(
  orderStatus: OrderStatus | null,
  riderStatus: string | null,
  riderStatusLabel: string | null,
) {
  if (orderStatus === OrderStatus.PICKED_UP) {
    return "Heading to Customer";
  }
  if (orderStatus === OrderStatus.OUT_FOR_DELIVERY) {
    return "Heading to Customer";
  }
  if (orderStatus === OrderStatus.ARRIVED) {
    return "Arrived at Customer";
  }

  if (riderStatusLabel?.trim()) {
    return riderStatusLabel.trim();
  }

  if (!riderStatus) {
    return null;
  }

  return (
    RIDER_STATUS_LABELS[riderStatus]
    || riderStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
