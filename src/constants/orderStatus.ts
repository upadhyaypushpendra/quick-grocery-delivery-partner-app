export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'going_for_pickup',
  'out_for_delivery',
  'reached',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderStatusColor = {
  bg: string;
  border: string;
  text: string;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Order Accepted',
  going_for_pickup: 'Going for Pickup',
  out_for_delivery: 'Out for Delivery',
  reached: 'Reached Customer',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  pending: '⏳',
  accepted: '✅',
  going_for_pickup: '🏃',
  out_for_delivery: '🚚',
  reached: '📍',
  delivered: '✓',
  cancelled: '✗',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, OrderStatusColor> = {
  pending: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' },
  accepted: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  going_for_pickup: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
  },
  out_for_delivery: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
  },
  reached: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800' },
  delivered: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
};

export const DP_ACTIVE_TRACKING_STATUSES: OrderStatus[] = [
  'accepted',
  'going_for_pickup',
  'out_for_delivery',
  'reached',
  'delivered',
];

export const DP_CANCELLED_TRACKING_STATUSES: OrderStatus[] = [
  'accepted',
  'cancelled',
];

export const COMPLETED_ORDER_FINAL_STATUSES: OrderStatus[] = [
  'delivered',
  'cancelled',
];

export const DP_PICKUP_DONE_STATUSES: OrderStatus[] = [
  'going_for_pickup',
  'out_for_delivery',
  'reached',
  'delivered',
];

export const DP_OUT_FOR_DELIVERY_DONE_STATUSES: OrderStatus[] = [
  'out_for_delivery',
  'reached',
  'delivered',
];

export const DP_REACHED_STATUSES: OrderStatus[] = ['reached'];

export const formatOrderStatus = (status: string): string => {
  const typedStatus = status as OrderStatus;
  if (ORDER_STATUS_LABELS[typedStatus]) {
    return ORDER_STATUS_LABELS[typedStatus];
  }

  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
