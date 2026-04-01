import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../stores/authStore';
import type { OrderStatus } from '../constants/orderStatus';
import { toNumber, toOptionalNumber } from '../lib/parsers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  addressSnapshot: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    phone?: string;
  };
  items: OrderItem[];
  statusHistory: Array<{
    id: string;
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  completed: boolean;
  deliveryPartner?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

const normalizeOrder = (order: Record<string, unknown>): Order => ({
  ...order,
  totalAmount: toNumber(order.totalAmount, 0),
  deliveryFee: toNumber(order.deliveryFee, 0),
  deliveryLatitude: toOptionalNumber(order.deliveryLatitude),
  deliveryLongitude: toOptionalNumber(order.deliveryLongitude),
  items: Array.isArray(order.items)
    ? order.items.filter(isRecord).map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: toNumber(item.unitPrice, 0),
      }))
    : [],
  statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : [],
}) as Order;

export function useOrders() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const response = await apiClient.get('/orders/assigned/list');
      return Array.isArray(response.data)
        ? response.data.filter(isRecord).map(normalizeOrder)
        : [];
    },
    enabled: !!token,
    staleTime: 0,
    refetchInterval: 15_000,
  });
}
