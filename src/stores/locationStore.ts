import { create } from 'zustand';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp: number;
}

interface LocationStore {
  currentLocation: Location | null;
  isTracking: boolean;
  error: string | null;

  setLocation: (location: Location) => void;
  setTracking: (tracking: boolean) => void;
  setError: (error: string | null) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  currentLocation: null,
  isTracking: false,
  error: null,

  setLocation: (location) => set({ currentLocation: location, error: null }),
  setTracking: (tracking) =>
    set((state) => (state.isTracking === tracking ? state : { isTracking: tracking })),
  setError: (error) => set((state) => (state.error === error ? state : { error })),
  clearLocation: () =>
    set((state) => (state.currentLocation === null ? state : { currentLocation: null })),
}));
