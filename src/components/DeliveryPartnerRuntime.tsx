import { useEffect, useRef } from 'react';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../stores/authStore';
import { useLocationStore } from '../stores/locationStore';
import { useOrderStore } from '../stores/orderStore';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useOrderRequests } from '../hooks/useOrderRequests';
import { getApiErrorMessage } from '../lib/parsers';

export default function DeliveryPartnerRuntime() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const clearLocation = useLocationStore((s) => s.clearLocation);
  const clearOrders = useOrderStore((s) => s.clear);
  const lastSyncedTimestampRef = useRef<number | null>(null);

  useOrderRequests();
  useLocationTracking(Boolean(accessToken));

  useEffect(() => {
    if (!accessToken) {
      clearLocation();
      clearOrders();
      lastSyncedTimestampRef.current = null;
      return;
    }

    void apiClient.post('/location/start').catch((error: unknown) => {
      console.error(
        'Failed to start location tracking:',
        getApiErrorMessage(error, 'Unknown location tracking start error'),
      );
    });

    return () => {
      void apiClient.post('/location/stop').catch((error: unknown) => {
        console.error(
          'Failed to stop location tracking:',
          getApiErrorMessage(error, 'Unknown location tracking stop error'),
        );
      });
      clearLocation();
      clearOrders();
      lastSyncedTimestampRef.current = null;
    };
  }, [accessToken, clearLocation, clearOrders]);

  useEffect(() => {
    if (!accessToken || !currentLocation) {
      return;
    }

    if (lastSyncedTimestampRef.current === currentLocation.timestamp) {
      return;
    }

    lastSyncedTimestampRef.current = currentLocation.timestamp;

    void apiClient
      .post('/location', {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        speed: currentLocation.speed,
      })
      .catch((error: unknown) => {
        console.error(
          'Failed to update location:',
          getApiErrorMessage(error, 'Unknown location update error'),
        );
        lastSyncedTimestampRef.current = null;
      });
  }, [accessToken, currentLocation]);

  return null;
}