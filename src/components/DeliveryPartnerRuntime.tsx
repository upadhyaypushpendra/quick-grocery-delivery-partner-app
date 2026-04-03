import { useEffect, useRef } from 'react';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../stores/authStore';
import { useLocationStore } from '../stores/locationStore';
import { useOrderStore } from '../stores/orderStore';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useOrderRequests } from '../hooks/useOrderRequests';
import { getApiErrorMessage } from '../lib/parsers';

const MIN_DISTANCE_METERS = 50;

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DeliveryPartnerRuntime() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const clearLocation = useLocationStore((s) => s.clearLocation);
  const clearOrders = useOrderStore((s) => s.clear);
  const lastSyncedTimestampRef = useRef<number | null>(null);
  const lastSyncedPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useOrderRequests();
  useLocationTracking(Boolean(accessToken));

  useEffect(() => {
    if (!accessToken) {
      clearLocation();
      clearOrders();
      lastSyncedTimestampRef.current = null;
      lastSyncedPositionRef.current = null;
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
      lastSyncedPositionRef.current = null;
    };
  }, [accessToken, clearLocation, clearOrders]);

  useEffect(() => {
    if (!accessToken || !currentLocation) {
      return;
    }

    if (lastSyncedTimestampRef.current === currentLocation.timestamp) {
      return;
    }

    // Skip if moved less than 50 metres from last synced position
    if (lastSyncedPositionRef.current) {
      const dist = haversineDistance(
        lastSyncedPositionRef.current.latitude,
        lastSyncedPositionRef.current.longitude,
        currentLocation.latitude,
        currentLocation.longitude,
      );
      if (dist < MIN_DISTANCE_METERS) {
        lastSyncedTimestampRef.current = currentLocation.timestamp;
        return;
      }
    }

    lastSyncedTimestampRef.current = currentLocation.timestamp;
    lastSyncedPositionRef.current = { latitude: currentLocation.latitude, longitude: currentLocation.longitude };

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