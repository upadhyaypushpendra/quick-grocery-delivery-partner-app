import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { OrderStatus } from '../constants/orderStatus';

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
  const retryTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(
    (id: string, token: string) => {
      const url = `/api/orders/${id}/events?token=${token}`;
      const es = new EventSource(url, { withCredentials: true });

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
        // Reconnect with exponential backoff
        retryTimerRef.current = setTimeout(() => {
          retryDelayRef.current = Math.min(
            retryDelayRef.current * 2,
            MAX_RETRY_DELAY,
          );
          connect(id, token);
        }, retryDelayRef.current);
      };

      return es;
    },
    [],
  );

  useEffect(() => {
    if (!orderId || !accessToken || !shouldConnect) return;

    retryDelayRef.current = INITIAL_RETRY_DELAY;
    const es = connect(orderId, accessToken);

    return () => {
      clearTimeout(retryTimerRef.current);
      es.close();
    };
  }, [orderId, accessToken, shouldConnect, connect]);

  return { statusEvents, isConnected };
}
