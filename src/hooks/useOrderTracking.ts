import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { OrderStatus } from '../constants/orderStatus';
import { refreshAccessToken } from '../lib/refreshAccessToken';

export interface StatusEvent {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

const MAX_RETRY_DELAY = 30_000;
const INITIAL_RETRY_DELAY = 2_000;

export function useOrderTracking(
  orderId: string | undefined,
  shouldConnect: boolean = true,
) {
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!orderId || !accessToken || !shouldConnect) return;

    retryDelayRef.current = INITIAL_RETRY_DELAY;
    let es: EventSource;

    const connect = () => {
      const currentToken = useAuthStore.getState().accessToken;
      if (!currentToken) return;

      es = new EventSource(`/api/orders/${orderId}/events?token=${currentToken}`, {
        withCredentials: true,
      });

      es.onopen = () => {
        setIsConnected(true);
        retryDelayRef.current = INITIAL_RETRY_DELAY;
      };

      es.onmessage = (event) => {
        try {
          const data: StatusEvent = JSON.parse(event.data);
          setStatusEvents((prev) => [...prev, data]);
        } catch (error) {
          console.error('Failed to parse order tracking event:', error);
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
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
    };
  }, [orderId, accessToken, shouldConnect]);

  return { statusEvents, isConnected };
}
