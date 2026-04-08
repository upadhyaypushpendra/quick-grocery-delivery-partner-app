import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { OrderStatus } from '../constants/orderStatus';
import { toNumber, toOptionalNumber } from '../lib/parsers';
import { refreshAccessToken } from '../lib/refreshAccessToken';

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

const INITIAL_RETRY_DELAY = 2_000;
const MAX_RETRY_DELAY = 30_000;

export function useOrders() {
  const token = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(!!token);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!token) return;

    let es: EventSource;

    const connect = () => {
      const currentToken = useAuthStore.getState().accessToken;
      if (!currentToken) return;
      const baseUrl = import.meta.env.VITE_API_URL ?? '/api';
      es = new EventSource(`${baseUrl}/orders/assigned/stream?token=${currentToken}`);

      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'orders' && Array.isArray(msg.orders)) {
            setData(msg.orders.filter(isRecord).map(normalizeOrder));
            setIsLoading(false);
            retryDelayRef.current = INITIAL_RETRY_DELAY;
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es.close();
        setIsLoading(false);
        refreshAccessToken()
          .catch(() => {/* clearAuth + redirect handled inside refreshAccessToken */})
          .finally(() => {
            retryTimerRef.current = setTimeout(() => {
              retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_DELAY);
              connect();
            }, retryDelayRef.current);
          });
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimerRef.current);
      es?.close();
      setData([]);
    };
  }, [token]);

  const refetch = () => {};

  return { data, isLoading, refetch };
}
