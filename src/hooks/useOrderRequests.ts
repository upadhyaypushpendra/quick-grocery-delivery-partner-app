import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOrderStore } from '../stores/orderStore';
import type { OrderRequest } from '../stores/orderStore';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../lib/apiClient';
import { toDateOrNow, toNumber, toOptionalNumber } from '../lib/parsers';
import { refreshAccessToken } from '../lib/refreshAccessToken';

const INITIAL_RETRY_DELAY = 2_000;
const MAX_RETRY_DELAY = 30_000;

interface OrderRequestsResponse {
  type: string;
  data?: unknown;
  message?: string;
  count?: number;
  requests?: unknown[];
  timestamp?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOrderRequest = (req: OrderRequest | null): req is OrderRequest =>
  req !== null;

const normalizeOrderRequest = (
  request: Record<string, unknown>,
): OrderRequest | null => {
  const id = typeof request.id === 'string' ? request.id : undefined;
  const orderId =
    typeof request.orderId === 'string' ? request.orderId : undefined;

  if (!id || !orderId) {
    return null;
  }

  return {
    id,
    orderId,
    deliveryFee: toNumber(request.deliveryFee, 0),
    pickupLatitude: toOptionalNumber(request.pickupLatitude),
    pickupLongitude: toOptionalNumber(request.pickupLongitude),
    deliveryLatitude: toOptionalNumber(request.deliveryLatitude),
    deliveryLongitude: toOptionalNumber(request.deliveryLongitude),
    expiresAt: toDateOrNow(request.expiresAt),
    createdAt: toDateOrNow(request.createdAt),
  };
};

/**
 * Listen to order requests via SSE
 */
export const useOrderRequests = () => {
  const { setPendingOrders } = useOrderStore();
  const { accessToken } = useAuthStore();
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!accessToken) return;

    let eventSource: EventSource;

    const connect = () => {
      const currentToken = useAuthStore.getState().accessToken;
      if (!currentToken) return;
      eventSource = new EventSource(`/api/order-requests/listen?token=${currentToken}`);

      eventSource.onmessage = (event) => {
        try {
          const message: OrderRequestsResponse = JSON.parse(event.data);

          if (message.type === 'connected') {
            retryDelayRef.current = INITIAL_RETRY_DELAY;
          } else if (message.type === 'order_request' && message.data) {
            const requests = Array.isArray(message.data)
              ? message.data
                  .filter(isRecord)
                  .map(normalizeOrderRequest)
                  .filter(isOrderRequest)
              : [];
            setPendingOrders(requests);
          } else if (message.type === 'error') {
            console.error('Order stream error:', message.message);
          }
        } catch (error) {
          console.error('Failed to parse order message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Order request stream error:', error);
        eventSource.close();
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
      eventSource?.close();
    };
  }, [setPendingOrders, accessToken]);
};

/**
 * Get pending order requests
 */
export const usePendingOrderRequests = () => {
  return useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: async () => {
      const response = await apiClient.get('/order-requests/pending');
      return {
        ...response.data,
        requests: Array.isArray(response.data?.requests)
          ? response.data.requests
              .filter(isRecord)
              .map(normalizeOrderRequest)
              .filter(isOrderRequest)
          : [],
      };
    },
    refetchInterval: 10 * 1000, // Refetch every 10 seconds as fallback
  });
};

/**
 * Accept order request
 */
export const useAcceptOrder = () => {
  const { acceptOrder } = useOrderStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderRequestId: string) => {
      const response = await apiClient.post(
        `/order-requests/${orderRequestId}/accept`,
      );
      return response.data;
    },
    onSuccess: async (_data, orderRequestId) => {
      acceptOrder(orderRequestId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
        queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] }),
      ]);
    },
  });
};

/**
 * Decline order request
 */
export const useDeclineOrder = () => {
  const { removePendingOrder } = useOrderStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderRequestId: string) => {
      const response = await apiClient.post(
        `/order-requests/${orderRequestId}/decline`,
      );
      return response.data;
    },
    onSuccess: async (_data, orderRequestId) => {
      removePendingOrder(orderRequestId);
      await queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
    },
  });
};
