import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/parsers";
import { useLocationStore, type Location } from "../stores/locationStore";

const LOCATION_UPDATE_INTERVAL = 30 * 1000; // 30 seconds
const LOCATION_TIMEOUT = 10 * 1000; // 10 seconds

/**
 * Use geolocation API to track GPS position every 30 seconds
 */
export const useLocationTracking = (enabled = true) => {
  const { setLocation, setTracking, setError } = useLocationStore();

  useEffect(() => {
    if (!enabled) {
      setTracking(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const getPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            timestamp: Date.now(),
          };
          setLocation(location);
          setError(null);
        },
        (error) => {
          let errorMsg = "Failed to get location";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg =
              "Location permission denied. Please enable it in settings.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "Location request timed out.";
          }
          setError(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: LOCATION_TIMEOUT,
          maximumAge: 0,
        },
      );
    };

    // Get initial position
    getPosition();

    // Set up interval to update every 30 seconds
    const intervalId = setInterval(getPosition, LOCATION_UPDATE_INTERVAL);
    setTracking(true);

    return () => {
      clearInterval(intervalId);
      setTracking(false);
    };
  }, [enabled, setLocation, setTracking, setError]);
};

/**
 * Send location to backend
 */
export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: async (location: Location) => {
      const response = await apiClient.post("/location", {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
      });
      return response.data;
    },
    onError: (error: unknown) => {
      console.error(
        "Failed to update location:",
        getApiErrorMessage(error, "Unknown location update error"),
      );
    },
  });
};

/**
 * Get current location from backend
 */
export const useGetLocation = () => {
  return useQuery({
    queryKey: ["location"],
    queryFn: async () => {
      const response = await apiClient.get("/location");
      return response.data;
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 0,
  });
};

/**
 * Start location tracking on backend
 */
export const useStartTracking = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/location/start");
      return response.data;
    },
  });
};

/**
 * Stop location tracking on backend
 */
export const useStopTracking = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/location/stop");
      return response.data;
    },
  });
};
